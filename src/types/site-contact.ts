export interface SiteContactItem {
  icon?: string
  label: string
  value: string
  link?: string | null
}

export interface SiteDonationQrcode {
  label: string
  src: string
}

export interface SiteDonation {
  tip: string
  qrcodes: SiteDonationQrcode[]
}

export interface SiteContactConfig {
  contacts: SiteContactItem[]
  donation: SiteDonation
}
