import { useState } from 'react'
import { Router as RouterIcon, ShieldAlert } from 'lucide-react'
import type { RouterCredentials, RouterVendor } from '@shared/types/router'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useT } from '../../i18n/useT'
import { useRouterInfo, useRouterReboot } from './useRouter'

const VENDORS: readonly RouterVendor[] = ['tplink', 'tenda', 'mikrotik', 'huawei', 'zte']

export default function RouterPage(): JSX.Element {
  const t = useT()
  const [vendor, setVendor] = useState<RouterVendor>('tplink')
  const [host, setHost] = useState('192.168.1.1')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [confirmReboot, setConfirmReboot] = useState(false)

  const info = useRouterInfo()
  const reboot = useRouterReboot()

  const request = (): { vendor: RouterVendor; credentials: RouterCredentials } => ({
    vendor,
    credentials: { host: host.trim(), username: username.trim(), password }
  })

  const dash = (v: string | null): string => v ?? t('router.unknown')

  const doReboot = (): void => {
    if (!confirmReboot) {
      setConfirmReboot(true)
      return
    }
    setConfirmReboot(false)
    reboot.mutate(request())
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <RouterIcon size={22} /> {t('router.title')}
        </h1>
        <p className="text-sm text-muted">{t('router.subtitle')}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('router.credentials')}</CardTitle>
        </CardHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('router.vendor')}>
            <select
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
              value={vendor}
              onChange={(e) => setVendor(e.target.value as RouterVendor)}
            >
              {VENDORS.map((v) => (
                <option key={v} value={v}>
                  {t(`router.vendor.${v}` as 'router.vendor.tplink')}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('router.host')}>
            <Input value={host} onChange={setHost} placeholder="192.168.1.1" />
          </Field>
          <Field label={t('router.username')}>
            <Input value={username} onChange={setUsername} placeholder="admin" />
          </Field>
          <Field label={t('router.password')}>
            <Input value={password} onChange={setPassword} type="password" placeholder="••••••" />
          </Field>
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <ShieldAlert size={14} /> {t('router.securityNote')}
        </p>
        {vendor === 'tplink' && <p className="mt-1 text-xs text-muted">{t('router.tplinkNote')}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => info.mutate(request())} disabled={info.isPending}>
            {info.isPending ? t('router.fetching') : t('router.fetchButton')}
          </Button>
          <Button variant="ghost" onClick={doReboot} disabled={reboot.isPending}>
            {reboot.isPending
              ? t('router.rebooting')
              : confirmReboot
                ? t('router.rebootConfirm')
                : t('router.rebootButton')}
          </Button>
        </div>

        {info.isError && (
          <p className="mt-3 text-sm text-danger">{t('router.fetchFailed')}: {info.error.message}</p>
        )}
        {reboot.isSuccess && <p className="mt-3 text-sm text-primary">{t('router.rebootDone')}</p>}
        {reboot.isError && (
          <p className="mt-3 text-sm text-danger">{t('router.rebootFailed')}: {reboot.error.message}</p>
        )}
      </Card>

      {info.data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('router.deviceInfo')}</CardTitle>
            </CardHeader>
            <Row label={t('router.model')} value={dash(info.data.device.model)} />
            <Row label={t('router.firmware')} value={dash(info.data.device.firmware)} />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('router.wanStatus')}</CardTitle>
            </CardHeader>
            <Row
              label={t('router.connected')}
              value={
                <Badge tone={info.data.wan.connected ? 'success' : 'danger'}>
                  {info.data.wan.connected ? t('common.yes') : t('common.no')}
                </Badge>
              }
            />
            <Row label={t('router.wanIp')} value={dash(info.data.wan.wanIp)} />
            <Row label={t('router.connectionType')} value={dash(info.data.wan.connectionType)} />
            <Row label={t('router.connUsername')} value={dash(info.data.wan.username)} />
          </Card>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      {children}
    </label>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text'
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}): JSX.Element {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary"
    />
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }): JSX.Element {
  return (
    <div className="flex justify-between border-b border-border/50 py-1.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
