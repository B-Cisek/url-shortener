export const CLICK_STREAM = 'analytics:clicks'
export const CLICK_DEAD_LETTER_STREAM = 'analytics:clicks:dead-letter'
export const CLICK_CONSUMER_GROUP = 'analytics-workers'

export const DEVICE_TYPES = ['mobile', 'tablet', 'desktop', 'unknown'] as const

export type DeviceType = (typeof DEVICE_TYPES)[number]

export interface ClickEvent {
  eventId: string
  urlId: string
  occurredAt: string
  countryCode: string
  deviceType: DeviceType
  referrerDomain: string
}
