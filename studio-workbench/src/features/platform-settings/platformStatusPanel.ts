import type {
  PlatformActionHintDto,
  PlatformEvidenceDto,
  PlatformScaffoldStatus,
} from '../../shared/api/backend'

export type PlatformStatusPanelItem = {
  id: string
  title: string
  subtitle: string
  status: PlatformScaffoldStatus
  fields: Array<{ label: string; value?: string | number }>
  evidence: PlatformEvidenceDto[]
  actions: PlatformActionHintDto[]
}
