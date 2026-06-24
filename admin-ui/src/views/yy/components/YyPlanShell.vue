<template>
  <div class="p-2">
    <el-card shadow="never" class="mb-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-[18px] font-semibold leading-6">{{ title }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
        </div>
        <el-tag effect="dark" type="danger">{{ code }}</el-tag>
      </div>

      <el-alert class="mt-4" :title="summary" type="info" :closable="false" show-icon />

      <el-descriptions class="mt-4" :column="2" border size="small">
        <el-descriptions-item label="后端落点">{{ backendTarget }}</el-descriptions-item>
        <el-descriptions-item label="前端落点">{{ frontendTarget }}</el-descriptions-item>
        <el-descriptions-item label="验收重点" :span="2">{{ note }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column label="步骤" prop="item" min-width="180" />
        <el-table-column label="后端动作" prop="backend" min-width="260" />
        <el-table-column label="前端动作" prop="frontend" min-width="260" />
        <el-table-column label="优先级" prop="priority" width="100" />
        <el-table-column label="状态" prop="status" width="110" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
interface YyPlanRow {
  item: string;
  backend: string;
  frontend: string;
  priority: string;
  status: string;
}

defineProps<{
  title: string;
  code: string;
  subtitle: string;
  summary: string;
  backendTarget: string;
  frontendTarget: string;
  note: string;
  rows: YyPlanRow[];
  loading?: boolean;
}>();
</script>
