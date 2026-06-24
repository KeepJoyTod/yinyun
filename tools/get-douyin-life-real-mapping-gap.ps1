[CmdletBinding()]
param(
    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile = 'C:\Users\Administrator\Desktop\服务器\香港2.txt',

    [string]$DockerContainer = 'yingyue-postgres',

    [string]$Database = 'yingyue_cloud',

    [string]$DbUser = 'yingyue',

    [string]$OutputJsonPath = '',

    [switch]$AsJson,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function New-GapSql {
    return @"
\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null ''

with expected_products(product_id, sku_id, product_name, observed_orders) as (
    values
      ('1765136728900670', '1765136728900670', '【毕业工作季】成人精致证件照｜大学入学工作简历驾照通用｜含装造｜现场精修立等可取', 2),
      ('1772297209231363', '1772297209231363', '儿童证件照｜适用入园、入学、钢琴美术书法舞蹈竞赛考级等｜提供服装化妆｜精修+打印', 2),
      ('1768121210918952', '1768121210918952', '【2026马年孕妈单人照】孕妇照｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台', 1),
      ('1834803890491392', '1834803890491392', '【大学开学必备】精致证件照｜三色三版打印｜适用校园卡四六级教资公考、入职晋升｜提供服装化妆|立等可取', 1),
      ('1867489036547136', '1867489036547136', '【孕妈准爸合影】孕妇照双人｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台', 1)
),
expected_mappings(external_poi_id, poi_name, store_id, store_code, external_product_id, external_sku_id, product_name, observed_orders) as (
    values
      ('7342410951733282851', '一悦照相馆(滨州万达店)', 900000000000000100::bigint, 'BZ-WANDA', '1772297209231363', '1772297209231363', '儿童证件照｜适用入园、入学、钢琴美术书法舞蹈竞赛考级等｜提供服装化妆｜精修+打印', 2),
      ('7342410951733282851', '一悦照相馆(滨州万达店)', 900000000000000100::bigint, 'BZ-WANDA', '1834803890491392', '1834803890491392', '【大学开学必备】精致证件照｜三色三版打印｜适用校园卡四六级教资公考、入职晋升｜提供服装化妆|立等可取', 1),
      ('7342410951733282851', '一悦照相馆(滨州万达店)', 900000000000000100::bigint, 'BZ-WANDA', '1765136728900670', '1765136728900670', '【毕业工作季】成人精致证件照｜大学入学工作简历驾照通用｜含装造｜现场精修立等可取', 1),
      ('7228779175929186363', '一悦照相馆(滨州吾悦店)', 900000000000000200::bigint, 'BZ-WUYUE', '1768121210918952', '1768121210918952', '【2026马年孕妈单人照】孕妇照｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台', 1),
      ('7228779175929186363', '一悦照相馆(滨州吾悦店)', 900000000000000200::bigint, 'BZ-WUYUE', '1867489036547136', '1867489036547136', '【孕妈准爸合影】孕妇照双人｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台', 1),
      ('7228779175929186363', '一悦照相馆(滨州吾悦店)', 900000000000000200::bigint, 'BZ-WUYUE', '1765136728900670', '1765136728900670', '【毕业工作季】成人精致证件照｜大学入学工作简历驾照通用｜含装造｜现场精修立等可取', 1)
),
stores as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'storeId', e.store_id::text,
        'expectedCode', e.store_code,
        'actualCode', coalesce(s.store_code, ''),
        'storeName', coalesce(s.store_name, ''),
        'exists', s.id is not null,
        'delFlag', coalesce(s.del_flag, '')
    ) order by e.store_id), '[]'::jsonb) as data
    from (select distinct store_id, store_code from expected_mappings) e
    left join yy_store s
      on s.id = e.store_id
     and s.tenant_id = '000000'
),
product_matches as (
    select e.*,
           p.id as yy_product_id,
           p.store_id as yy_product_store_id,
           p.product_name as yy_product_name,
           p.status as yy_product_status,
           p.del_flag as yy_product_del_flag
    from expected_products e
    left join yy_product p
      on p.tenant_id = '000000'
     and p.product_type = 'DOUYIN_LIFE'
     and p.del_flag = '0'
     and (
       p.remark like '%' || e.sku_id || '%'
       or p.product_name = e.product_name
     )
),
products as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'productId', product_id,
        'skuId', sku_id,
        'expectedName', product_name,
        'observedOrders', observed_orders,
        'yyProductId', coalesce(yy_product_id::text, ''),
        'yyProductStoreId', coalesce(yy_product_store_id::text, ''),
        'yyProductName', coalesce(yy_product_name, ''),
        'exists', yy_product_id is not null
    ) order by sku_id, coalesce(yy_product_id, 0)), '[]'::jsonb) as data
    from product_matches
),
mapping_matches as (
    select e.*,
           m.id as mapping_id,
           m.store_id as mapping_store_id,
           m.product_id as mapping_product_id,
           m.mapping_status,
           m.external_name,
           m.del_flag as mapping_del_flag
    from expected_mappings e
    left join yy_channel_product_mapping m
      on m.tenant_id = '000000'
     and m.channel_type = 'DOUYIN_LIFE'
     and m.external_poi_id = e.external_poi_id
     and m.external_sku_id = e.external_sku_id
     and m.del_flag = '0'
),
mappings as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'poiId', external_poi_id,
        'poiName', poi_name,
        'expectedStoreId', store_id::text,
        'expectedStoreCode', store_code,
        'productId', external_product_id,
        'skuId', external_sku_id,
        'productName', product_name,
        'observedOrders', observed_orders,
        'mappingId', coalesce(mapping_id::text, ''),
        'mappingStoreId', coalesce(mapping_store_id::text, ''),
        'mappingProductId', coalesce(mapping_product_id::text, ''),
        'mappingStatus', coalesce(mapping_status, ''),
        'externalName', coalesce(external_name, ''),
        'exists', mapping_id is not null,
        'activeOnExpectedStore', mapping_id is not null and mapping_store_id = store_id and mapping_status = 'ACTIVE'
    ) order by external_poi_id, external_sku_id, coalesce(mapping_id, 0)), '[]'::jsonb) as data
    from mapping_matches
),
mapping_gap as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'poiId', external_poi_id,
        'poiName', poi_name,
        'storeId', store_id::text,
        'storeCode', store_code,
        'productId', external_product_id,
        'skuId', external_sku_id,
        'productName', product_name,
        'reason', case
            when mapping_id is null then 'MISSING'
            when mapping_store_id is distinct from store_id then 'WRONG_STORE'
            when mapping_status is distinct from 'ACTIVE' then 'NOT_ACTIVE'
            else 'OK'
        end
    ) order by external_poi_id, external_sku_id), '[]'::jsonb) as data
    from mapping_matches
    where mapping_id is null
       or mapping_store_id is distinct from store_id
       or mapping_status is distinct from 'ACTIVE'
),
order_counts as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'poiId', e.external_poi_id,
        'skuId', e.external_sku_id,
        'storeId', e.store_id::text,
        'matchingLocalOrders', coalesce(o.cnt, 0)
    ) order by e.external_poi_id, e.external_sku_id), '[]'::jsonb) as data
    from expected_mappings e
    left join lateral (
        select count(*) as cnt
        from yy_order o
        where o.tenant_id = '000000'
          and o.del_flag = '0'
          and o.channel_type = 'DOUYIN_LIFE'
          and o.external_poi_id = e.external_poi_id
          and o.external_sku_id = e.external_sku_id
    ) o on true
)
select jsonb_build_object(
    'generatedAt', to_char(now(), 'YYYY-MM-DD HH24:MI:SS TZH:TZM'),
    'mode', 'READ_ONLY_MAPPING_GAP',
    'stores', (select data from stores),
    'products', (select data from products),
    'mappings', (select data from mappings),
    'mappingGap', (select data from mapping_gap),
    'orderCounts', (select data from order_counts)
)::text;
"@
}

function Invoke-Hk2Sql {
    param([Parameter(Mandatory = $true)][string]$Sql)

    $encodedSql = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($Sql))
    $remoteCommand = "tmp=`$(mktemp); printf '%s' '$encodedSql' | base64 -d > `$tmp; docker exec -i $DockerContainer psql -q -U $DbUser -d $Database -v ON_ERROR_STOP=1 < `$tmp; rc=`$?; rm -f `$tmp; exit `$rc"
    $helper = Join-Path $PSScriptRoot 'invoke-hk2.ps1'
    & $helper -SshHost $SshHost -SshUser $SshUser -SshPasswordFile $SshPasswordFile -Command $remoteCommand -TimeoutSec 120
}

function Get-JsonFromOutput {
    param([Parameter(Mandatory = $true)][object[]]$Output)

    $lines = @($Output | ForEach-Object { [string]$_ } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    $jsonLines = @($lines | Where-Object { $_.TrimStart().StartsWith('{') })
    if ($jsonLines.Count -eq 0) {
        throw 'empty mapping gap output'
    }
    return ([string]$jsonLines[-1]).Trim()
}

function Write-JsonArtifact {
    param(
        [Parameter(Mandatory = $true)][string]$Json,
        [string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return
    }
    $parent = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $Json, $utf8NoBom)
}

$sql = New-GapSql
if ($DryRun) {
    Write-Host $sql
    exit 0
}

$output = @(Invoke-Hk2Sql -Sql $sql)
$jsonText = Get-JsonFromOutput -Output $output
Write-JsonArtifact -Json $jsonText -Path $OutputJsonPath

if ($AsJson) {
    Write-Host $jsonText
    exit 0
}

$report = $jsonText | ConvertFrom-Json
Write-Host 'douyin life real mapping gap'
Write-Host "generatedAt: $($report.generatedAt)"
Write-Host "products: $($report.products.Count)"
Write-Host "mappings: $($report.mappings.Count)"
Write-Host "gap: $($report.mappingGap.Count)"
Write-Host ''
Write-Host 'mapping gap'
$report.mappingGap |
    Select-Object poiId, storeCode, skuId, reason, productName |
    Format-Table -AutoSize |
    Out-String |
    Write-Host
