import { useParams } from 'react-router-dom'
import { useApi } from '@/hooks/useApi.js'
import { findOperation } from '@/lib/spec/select.js'
import { OperationLayout } from '@/components/operation/OperationLayout.jsx'
import { NotFoundPage } from './NotFoundPage.jsx'

export function OperationPage() {
  const { operationId } = useParams()
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <NotFoundPage />
  const op = findOperation(api, operationId)
  if (!op) return <NotFoundPage label={`Operation "${operationId}"`} />
  return <OperationLayout operation={op} apiSlug={api.slug} />
}
