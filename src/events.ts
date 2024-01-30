import { EventEmitter, Unit } from "github.com/octarine-public/wrapper/index"

import { EMenuType } from "./enum"

interface RadiusesEvents extends EventEmitter {
	on(
		name: "MenuChanged",
		callback: (eventType: EMenuType, unit?: Unit) => void,
		priority?: number
	): RadiusesEvents
}

export const RadiusesEvents: RadiusesEvents = new EventEmitter()
