import "./translate"

import {
	DOTAGameState,
	Entity,
	EventsSDK,
	ParticlesSDK,
	Tower
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "./menu/index"
import { TowerManager } from "./tower"

const bootstrap = new (class CRadiusesBootstrap {
	private readonly towers: TowerManager
	private readonly menu = new MenuManager()
	private readonly pSDK = new ParticlesSDK()

	constructor() {
		this.towers = new TowerManager(this.menu.TowerMenu, this.pSDK)
	}

	public EntityCreated(entity: Entity) {
		if (entity instanceof Tower) {
			this.towers.EntityCreated(entity)
		}
	}

	public LifeStateChanged(entity: Entity) {
		if (entity instanceof Tower) {
			this.towers.LifeStateChanged(entity)
		}
	}

	public EntityDestroyed(entity: Entity) {
		if (entity instanceof Tower) {
			this.towers.EntityDestroyed(entity)
		}
	}

	public GameStateChanged(newState: DOTAGameState) {
		this.towers.GameStateChanged(newState)
	}
})()

EventsSDK.on("EntityCreated", entity => bootstrap.EntityCreated(entity))

EventsSDK.on("EntityDestroyed", entity => bootstrap.EntityDestroyed(entity))

EventsSDK.on("LifeStateChanged", entity => bootstrap.EntityCreated(entity))

EventsSDK.on("GameStateChanged", state => bootstrap.GameStateChanged(state))
