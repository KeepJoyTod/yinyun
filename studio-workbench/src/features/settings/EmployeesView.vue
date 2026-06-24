<template>
  <div class="flex flex-col gap-7">
    <section class="yy-glass-panel employee-hero rounded-2xl p-6">
      <div class="relative z-[1] flex items-end justify-between gap-6 max-[820px]:flex-col max-[820px]:items-start">
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-dark text-[#F4EFE6] shadow-[0_16px_34px_rgba(26,24,20,0.18)]">
            <UsersRound :size="26" :stroke-width="1.8" />
          </div>
          <div>
            <span class="inline-flex items-center rounded-full border border-amber-accent/25 bg-amber-accent/[0.10] px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Employee Roster</span>
            <h2 class="mt-3 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">员工管理</h2>
            <p class="mt-2 max-w-[620px] text-[13.5px] font-sans leading-relaxed text-amber-text-muted">
              管理门店员工、岗位、技能标签和排班可用状态，把摄影、修图、前台和交付动作都收进同一个工作台。
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span class="rounded-full border border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--color-status-done)]">在岗 {{ activeEmployees.length }}</span>
              <span class="rounded-full border border-[var(--color-status-confirmed-border)] bg-[var(--color-status-confirmed-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--color-status-confirmed)]">技能 {{ skillCoverageCount }}</span>
              <span class="rounded-full border border-amber-topbar-border/60 bg-white/55 px-3 py-1 text-[12px] font-semibold text-amber-text-muted">门店 {{ storeCoverageCount }}</span>
            </div>
          </div>
        </div>
        <button
          class="yy-action flex min-h-[42px] items-center gap-2 rounded-xl border border-amber-dark bg-amber-dark px-4 py-2.5 text-[13px] font-semibold text-[#F4EFE6] shadow-[0_14px_28px_rgba(26,24,20,0.18)] hover:bg-black"
          type="button"
          @click="openCreate"
        >
          <Plus :size="16" :stroke-width="2" />
          新增员工
        </button>
      </div>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="employee-ops-board yy-glass-panel rounded-2xl">
      <div class="relative z-[1] border-b border-amber-topbar-border/60 p-5">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickEmployeeFilters"
            :key="filter.key"
            class="yy-action min-h-[36px] rounded-xl border px-3.5 py-2 text-[12px] font-sans font-semibold transition-all"
            :class="activeEmployeeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6] shadow-[0_10px_24px_rgba(26,24,20,0.12)]' : 'border-amber-topbar-border/70 bg-white/45 text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeEmployeeFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
        </div>
        <div class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div class="rounded-2xl border border-amber-topbar-border/60 bg-white/60 p-3.5">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="text-[12px] font-bold text-amber-dark">岗位分布</div>
                <div class="mt-1 text-[11px] text-amber-text-muted">按员工角色快速看结构</div>
              </div>
              <UsersRound :size="17" :stroke-width="1.8" class="text-amber-accent" />
            </div>
            <div class="mt-3 space-y-2.5">
              <div v-for="role in roleDistribution" :key="role.label">
                <div class="flex items-center justify-between gap-3 text-[11px] text-amber-text-muted">
                  <span class="font-semibold text-amber-dark">{{ role.label }}</span>
                  <span>{{ role.count }} 人</span>
                </div>
                <div class="mt-1.5 h-2 rounded-full bg-amber-bg/70">
                  <div class="h-2 rounded-full bg-[linear-gradient(90deg,var(--color-status-pending),var(--color-status-done))]" :style="{ width: `${role.percent}%` }"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-amber-topbar-border/60 bg-white/60 p-3.5">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="text-[12px] font-bold text-amber-dark">技能广度</div>
                <div class="mt-1 text-[11px] text-amber-text-muted">更适合排班和分工</div>
              </div>
              <Sparkles :size="17" :stroke-width="1.8" class="text-amber-accent" />
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="skill in topSkillTags"
                :key="skill.name"
                class="rounded-full border border-amber-topbar-border/60 bg-white/70 px-3 py-1 text-[11px] font-semibold text-amber-dark"
              >
                {{ skill.name }} · {{ skill.count }}
              </span>
              <span v-if="!topSkillTags.length" class="text-[12px] text-amber-text-muted">暂无技能标签</span>
            </div>
          </div>
          <div class="rounded-2xl border border-amber-topbar-border/60 bg-white/60 p-3.5">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="text-[12px] font-bold text-amber-dark">门店覆盖</div>
                <div class="mt-1 text-[11px] text-amber-text-muted">当前员工归属门店</div>
              </div>
              <Store :size="17" :stroke-width="1.8" class="text-amber-accent" />
            </div>
            <div class="mt-3 space-y-1.5">
              <div class="flex items-center justify-between text-[12px]">
                <span class="text-amber-dark">覆盖门店</span>
                <span class="font-semibold text-amber-dark">{{ storeCoverageCount }}</span>
              </div>
              <div class="flex items-center justify-between text-[12px]">
                <span class="text-amber-dark">平均技能数</span>
                <span class="font-semibold text-amber-dark">{{ averageSkillCount }}</span>
              </div>
              <div class="rounded-xl border border-amber-topbar-border/60 bg-amber-bg/30 px-3 py-1.5 text-[11px] text-amber-text-muted">
                员工分布已经足够支持门店级筛选、岗位分组和后续排班日历。
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="relative z-[1] grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(item, idx) in cards"
          :key="item.label"
          class="yy-surface relative overflow-hidden rounded-2xl border border-amber-topbar-border/70 bg-white/58 p-4 shadow-sm backdrop-blur"
        >
          <div
            class="absolute inset-x-0 top-0 h-[3px]"
            :class="cardAccentColors[idx]"
          ></div>
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[13px] font-sans font-bold text-amber-dark">{{ item.label }}</div>
              <div class="mt-1 text-[12px] font-sans leading-relaxed text-amber-text-muted">{{ item.hint }}</div>
            </div>
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-topbar-border/60 bg-amber-content-bg text-amber-accent">
              <UsersRound v-if="item.icon === 'users'" :size="18" :stroke-width="1.8" />
              <CalendarClock v-else-if="item.icon === 'calendar'" :size="18" :stroke-width="1.8" />
              <Sparkles v-else-if="item.icon === 'sparkles'" :size="18" :stroke-width="1.8" />
              <Store v-else :size="18" :stroke-width="1.8" />
            </div>
          </div>
          <div class="mt-5 flex items-end justify-between gap-3">
            <strong class="text-[34px] leading-none font-sans font-black tabular-nums text-amber-dark">{{ item.value }}</strong>
            <span class="rounded-full bg-amber-dark/[0.06] px-2.5 py-1 text-[11px] font-mono font-semibold text-amber-text-muted">{{ item.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="overflow-hidden rounded-2xl border border-amber-topbar-border/70 bg-amber-content-bg/78 shadow-[0_18px_44px_rgba(26,24,20,0.06)] backdrop-blur">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border/60 bg-white/44 px-5 py-4 max-[920px]:flex-col max-[920px]:items-start">
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
            选择门店
            <select
              v-model="storeFilter"
              class="h-10 min-w-[150px] border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] rounded-xl text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20"
            >
              <option v-if="canUseGlobalStoreScope" value="all">全部门店</option>
              <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="String(store.backendId)">
                {{ store.name }}
              </option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
            选择状态
            <select
              v-model="statusFilter"
              class="h-10 min-w-[120px] border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] rounded-xl text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20"
            >
              <option value="all">全部状态</option>
              <option value="ACTIVE">在岗</option>
              <option value="DISABLED">停用</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
            选择角色
            <select
              v-model="roleFilter"
              class="h-10 min-w-[120px] border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] rounded-xl text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20"
            >
              <option value="all">全部角色</option>
              <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
            关键字
            <input
              v-model="searchQuery"
              class="h-10 w-[250px] border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] rounded-xl text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20 max-[720px]:w-full"
              placeholder="请输入手机、工号、姓名、职位"
              type="text"
            />
          </label>
        </div>
        <button
          class="yy-action flex min-h-[38px] items-center gap-2 rounded-xl border border-amber-topbar-border bg-white/62 px-3 py-2 text-[12px] font-sans font-semibold text-amber-text-muted hover:bg-white"
          type="button"
          :disabled="loading"
          @click="reload"
        >
          <RefreshCw :size="14" :stroke-width="1.9" :class="loading ? 'animate-spin' : ''" />
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-amber-bg/18 text-left">
              <th class="px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">姓名</th>
              <th class="px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">手机</th>
              <th class="px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">角色</th>
              <th class="px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">门店</th>
              <th class="px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">状态</th>
              <th class="px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">添加日期</th>
              <th class="px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/50">
            <tr v-for="employee in filteredEmployees" :key="employee.backendId" class="yy-clickable-row hover:bg-amber-accent/[0.035] transition-colors">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[14px] font-black text-amber-content-bg shadow-[0_10px_24px_rgba(26,24,20,0.12)]" :class="employee.status === 'ACTIVE' ? 'bg-[var(--color-status-confirmed)]' : 'bg-[var(--color-status-neutral)]'">
                    {{ employeeInitial(employee) }}
                    <span class="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-amber-content-bg" :class="employee.status === 'ACTIVE' ? 'bg-[var(--color-status-done)]' : 'bg-[var(--color-status-neutral)]'"></span>
                  </div>
                  <div>
                    <span class="text-[14px] font-bold text-amber-dark">{{ employee.name }}</span>
                    <div class="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ employee.employeeNo }}</div>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <div class="font-mono text-[12px] text-amber-dark">{{ employee.mobile || '未填写' }}</div>
                <div class="mt-1 text-[11px] text-amber-text-muted">手机号可用于工作台检索</div>
              </td>
              <td class="px-5 py-4">
                <div class="text-[12.5px] font-bold text-amber-dark">{{ employee.roleType }}</div>
                <div class="mt-2 flex max-w-[260px] flex-wrap gap-1.5">
                  <span
                    v-for="skill in employee.skillTags.slice(0, 3)"
                    :key="`${employee.backendId}-${skill}`"
                    class="rounded-full border border-amber-topbar-border/60 bg-white/70 px-2 py-0.5 text-[11px] text-amber-text-muted"
                  >
                    {{ skill }}
                  </span>
                  <span v-if="!employee.skillTags.length" class="text-[11px] text-amber-text-muted">未配置技能</span>
                </div>
              </td>
              <td class="px-5 py-4">
                <div class="text-[12px] font-semibold text-amber-dark">{{ employee.storeName }}</div>
                <div class="mt-1 text-[11px] text-amber-text-muted">门店归属</div>
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  :class="employee.status === 'ACTIVE'
                    ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
                    : 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral)] border border-[var(--color-status-neutral-border)]'"
                >
                  {{ employee.status === 'ACTIVE' ? '在岗' : '停用' }}
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="text-[12px] text-amber-dark">{{ formatEmployeeCreatedAt(employee) }}</div>
                <div class="mt-1 text-[11px] text-amber-text-muted">登记日期</div>
              </td>
              <td class="px-5 py-4">
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    class="yy-action rounded-full border border-amber-topbar-border bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-amber-dark hover:bg-white"
                    type="button"
                    @click="openEdit(employee)"
                  >
                    详情
                  </button>
                  <button
                    class="yy-action rounded-full border border-amber-topbar-border bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-amber-dark hover:bg-white"
                    type="button"
                    @click="openEdit(employee)"
                  >
                    修改
                  </button>
                  <button
                    class="yy-action rounded-full border border-amber-topbar-border bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-amber-dark hover:bg-white disabled:opacity-60"
                    type="button"
                    :disabled="copyingEmployeeKey === employee.backendId"
                    @click="copyEmployeeSummary(employee)"
                  >
                    {{ copyingEmployeeKey === employee.backendId ? '复制中...' : copiedEmployeeKey === employee.backendId ? '已复制' : '复制资料' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!filteredEmployees.length" class="px-6 py-10 text-center">
        <div class="text-[15px] font-sans font-semibold text-amber-dark">当前筛选下没有员工</div>
        <p class="mt-2 text-[12px] text-amber-text-muted">可以切回全部员工，或者新增一个员工后再继续安排岗位。</p>
      </div>
    </section>

    <Transition name="fade">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
        @click.self="modalOpen = false"
      >
        <div class="w-full max-w-[680px] overflow-hidden rounded-[24px] border border-amber-topbar-border/70 bg-amber-content-bg/90 shadow-[0_28px_72px_rgba(26,24,20,0.28)] backdrop-blur-2xl">
          <div class="border-b border-amber-topbar-border/60 bg-white/48 px-6 py-5">
            <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Employee Form</span>
            <h3 class="mt-1 text-[22px] font-sans font-black text-amber-dark">{{ editingId ? '编辑员工' : '新增员工' }}</h3>
            <p class="mt-1 text-[12px] text-amber-text-muted">维护员工基础信息、岗位、技能标签和归属门店。</p>
          </div>
          <div class="grid grid-cols-2 gap-4 px-6 py-5 max-[720px]:grid-cols-1">
            <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
              门店
              <select v-model="form.storeBackendId" class="h-10 rounded-xl border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20">
                <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="store.backendId">
                  {{ store.name }}
                </option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
              员工编号
              <input v-model="form.employeeNo" class="h-10 rounded-xl border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
              员工姓名
              <input v-model="form.name" class="h-10 rounded-xl border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
              手机号
              <input v-model="form.mobile" class="h-10 rounded-xl border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
              岗位
              <input v-model="form.roleType" class="h-10 rounded-xl border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20" placeholder="摄影师 / 修图师 / 前台" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
              技能标签
              <input v-model="form.skillTags" class="h-10 rounded-xl border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20" placeholder="逗号分隔，如：证件照,精修" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
              状态
              <select v-model="form.status" class="h-10 rounded-xl border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20">
                <option value="ACTIVE">在岗</option>
                <option value="DISABLED">停用</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted">
              排序
              <input v-model.number="form.sort" class="h-10 rounded-xl border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20" min="0" type="number" />
            </label>
            <label class="flex flex-col gap-1 text-[11px] text-amber-text-muted max-[720px]:col-span-1">
              备注
              <input v-model="form.remark" class="h-10 rounded-xl border border-amber-topbar-border bg-white/88 px-3 text-[12.5px] text-amber-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-amber-accent/20" type="text" />
            </label>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border/60 bg-white/40 px-6 py-4">
            <button class="yy-action rounded-full border border-amber-topbar-border bg-white/70 px-4 py-2 text-[12px] font-semibold text-amber-text-muted hover:bg-white" type="button" @click="modalOpen = false">
              取消
            </button>
            <button class="yy-action rounded-full border border-amber-dark bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted" :disabled="saving" type="button" @click="submit">
              {{ saving ? '保存中...' : '保存员工' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { CalendarClock, Plus, RefreshCw, Sparkles, Store, UsersRound } from 'lucide-vue-next'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { appStore, type EmployeeInfo } from '../../shared/stores/appStore'
import { studioAccessStore } from '../../shared/stores/studioAccessStore'
import { useNotice } from '../../shared/composables/useNotice'
import {
  buildEmployeeDerivedState,
  buildEmployeeSaveInput,
  cardAccentColors,
  createEmployeeFormDraft,
  defaultConcreteStoreId as resolveDefaultConcreteStoreId,
  employeeInitial,
  fillEmployeeFormDraft,
  formatEmployeeCreatedAt,
  formatEmployeeSummary,
  normalizeStoreFilter as resolveStoreFilter,
  resetEmployeeFormDraft,
  type EmployeeFormDraft,
  type QuickEmployeeFilter,
} from './employeesOperations'

const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const { notice, pushNotice } = useNotice()
const employees = ref<EmployeeInfo[]>([])
const searchQuery = ref('')
const storeFilter = ref('all')
const roleFilter = ref('all')
const statusFilter = ref('all')
const activeEmployeeFilter = ref<QuickEmployeeFilter>('all')
const { copyingKey: copyingEmployeeKey, copiedKey: copiedEmployeeKey, copyText } = useCopyWithState()
const canUseGlobalStoreScope = computed(() => studioAccessStore.globalStoreScope)
const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))
const normalizeStoreFilter = (preferred = storeFilter.value) => resolveStoreFilter(preferred, canUseGlobalStoreScope.value, concreteStoreOptions.value)
const defaultConcreteStoreId = () => resolveDefaultConcreteStoreId(concreteStoreOptions.value, storeFilter.value)

const form = reactive<EmployeeFormDraft>(createEmployeeFormDraft())

const reload = async () => {
  loading.value = true
  try {
    employees.value = [...await appStore.loadEmployees()]
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '员工加载失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingId.value = null
  resetEmployeeFormDraft(form, defaultConcreteStoreId())
}

const openCreate = () => {
  resetForm()
  modalOpen.value = true
}

const openEdit = (employee: EmployeeInfo) => {
  editingId.value = employee.backendId
  fillEmployeeFormDraft(form, employee)
  modalOpen.value = true
}

const submit = async () => {
  saving.value = true
  try {
    const next = await appStore.saveEmployee(buildEmployeeSaveInput(editingId.value, form))
    modalOpen.value = false
    await reload()
    pushNotice('success', `${next.name} 已保存`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '员工保存失败')
  } finally {
    saving.value = false
  }
}

const scopedEmployees = computed(() => {
  if (canUseGlobalStoreScope.value && storeFilter.value === 'all') return employees.value
  if (!storeFilter.value) return []
  return employees.value.filter(employee => String(employee.storeBackendId) === storeFilter.value)
})
const roleOptions = computed(() => Array.from(new Set(scopedEmployees.value.map(employee => employee.roleType).filter(Boolean))))

const copyEmployeeSummary = async (employee: EmployeeInfo) => {
  await copyText(formatEmployeeSummary(employee), employee.backendId)
}

const employeeDerivedState = computed(() => buildEmployeeDerivedState(scopedEmployees.value, {
  storeFilter: storeFilter.value,
  roleFilter: roleFilter.value,
  statusFilter: statusFilter.value,
  activeEmployeeFilter: activeEmployeeFilter.value,
  searchQuery: searchQuery.value,
}))
const activeEmployees = computed(() => employeeDerivedState.value.activeEmployees)
const skillCoverageCount = computed(() => employeeDerivedState.value.skillCoverageCount)
const storeCoverageCount = computed(() => employeeDerivedState.value.storeCoverageCount)
const averageSkillCount = computed(() => employeeDerivedState.value.averageSkillCount)
const roleDistribution = computed(() => employeeDerivedState.value.roleDistribution)
const topSkillTags = computed(() => employeeDerivedState.value.topSkillTags)
const filteredEmployees = computed(() => employeeDerivedState.value.filteredEmployees)
const quickEmployeeFilters = computed(() => employeeDerivedState.value.quickEmployeeFilters)
const cards = computed(() => employeeDerivedState.value.cards)

watch(
  () => `${canUseGlobalStoreScope.value}:${concreteStoreOptions.value.map(store => `${store.backendId}:${store.name}`).join('|')}`,
  () => {
    if (!canUseGlobalStoreScope.value && storeFilter.value === 'all') {
      storeFilter.value = normalizeStoreFilter()
      return
    }
    storeFilter.value = normalizeStoreFilter()
  },
  { immediate: true },
)

onMounted(reload)
</script>
