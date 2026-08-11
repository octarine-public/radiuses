import { EMenuType } from "./enum"

export const RadiusesEvents = new EventEmitter<{
	MenuChanged: [eventType: EMenuType, unit?: Unit]
}>()
