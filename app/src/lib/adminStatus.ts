const ADMIN_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No-show',
  approved: 'Aprobada',
  hidden: 'Oculta',
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
  new: 'Nueva',
  contacted: 'Contactada',
  quoted: 'Cotizada',
  won: 'Ganada',
  lost: 'Perdida',
  read: 'Leído',
  replied: 'Respondido',
  active: 'Activo',
  inactive: 'Inactivo',
}

export function adminStatusLabel(status: string | null | undefined): string {
  if (!status) return '—'
  return ADMIN_STATUS_LABELS[status.toLowerCase()] ?? status
}
