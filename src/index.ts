import "./translate"

import {
	Ability,
	DOTAGameState,
	DOTAGameUIState,
	Entity,
	EventsSDK,
	GameRules,
	GameState,
	Hero,
	ParticlesSDK,
	Rune,
	SpiritBear,
	Tower,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { EMenuType } from "./enum"
import { RadiusesEvents } from "./events"
import { MenuManager } from "./menu/index"
import { BearManager } from "./modules/bears"
import { CustomRadiusManager } from "./modules/custom"
import { HeroManager } from "./modules/heroes"
import { RuneManager } from "./modules/runes"
import { TowerManager } from "./modules/tower"

new (class CRadiuses {
	private readonly pSDK = new ParticlesSDK()
	private readonly menu = new MenuManager()

	private readonly bears = new BearManager(this.menu, this.pSDK)
	private readonly runes = new RuneManager(this.menu, this.pSDK)
	private readonly heroes = new HeroManager(this.menu, this.pSDK)
	private readonly towers = new TowerManager(this.menu, this.pSDK)
	private readonly customRadius = new CustomRadiusManager(this.menu, this.pSDK)

	private get state() {
		return this.menu.State.value
	}

	private get isPostGame() {
		return (
			GameRules === undefined ||
			GameRules.GameState === DOTAGameState.DOTA_GAMERULES_STATE_POST_GAME
		)
	}

	private get isUIGame() {
		return GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
	}

	constructor() {
		EventsSDK.on("Draw", this.Draw.bind(this))
		EventsSDK.on("GameEnded", this.GameEnded.bind(this))
		EventsSDK.on("GameStarted", this.GameStarted.bind(this))
		EventsSDK.on("EntityCreated", this.EntityCreated.bind(this))
		EventsSDK.on("EntityDestroyed", this.EntityDestroyed.bind(this))
		EventsSDK.on("LifeStateChanged", this.LifeStateChanged.bind(this))
		EventsSDK.on("GameStateChanged", this.GameStateChanged.bind(this))
		EventsSDK.on("UnitItemsChanged", this.UnitItemsChanged.bind(this))
		EventsSDK.on("UnitPropertyChanged", this.UnitPropertyChanged.bind(this))
		EventsSDK.on("AbilityLevelChanged", this.AbilityLevelChanged.bind(this))
		EventsSDK.on("UnitAbilitiesChanged", this.UnitAbilitiesChanged.bind(this))
		EventsSDK.on("PostDataUpdate", this.PostDataUpdate.bind(this))
		RadiusesEvents.on("MenuChanged", this.MenuChanged.bind(this))
	}

	protected Draw() {
		if (!this.state || this.isPostGame) {
			return
		}
		if (this.isUIGame) {
			this.heroes.Draw()
			this.towers.Draw()
		}
	}

	protected PostDataUpdate() {
		if (!this.state || this.isPostGame) {
			return
		}
		this.bears.PostDataUpdate()
		this.heroes.PostDataUpdate()
	}

	protected EntityCreated(entity: Entity) {
		if (entity instanceof SpiritBear) {
			this.bears.EntityCreated(entity)
		}
		if (entity instanceof Tower) {
			this.towers.EntityCreated(entity)
		}
		if (entity instanceof Rune) {
			this.runes.EntityCreated(entity)
		}
		if (entity instanceof Hero) {
			this.heroes.EntityCreated(entity)
			this.customRadius.EntityCreated(entity)
		}
	}

	protected EntityDestroyed(entity: Entity) {
		if (entity instanceof Tower) {
			this.towers.EntityDestroyed(entity)
		}
		if (entity instanceof SpiritBear) {
			this.bears.EntityDestroyed(entity)
		}
		if (entity instanceof Rune) {
			this.runes.EntityDestroyed(entity)
		}
		if (entity instanceof Hero) {
			this.heroes.EntityDestroyed(entity)
			this.customRadius.EntityDestroyed(entity)
		}
		if (entity instanceof Ability) {
			this.bears.EntityDestroyed(entity)
			this.heroes.EntityDestroyed(entity)
		}
	}

	protected LifeStateChanged(entity: Entity) {
		if (entity instanceof Hero) {
			this.heroes.LifeStateChanged(entity)
			this.customRadius.LifeStateChanged(entity)
		}
		if (entity instanceof Tower) {
			this.towers.LifeStateChanged(entity)
		}
		if (entity instanceof SpiritBear) {
			this.bears.LifeStateChanged(entity)
		}
	}

	protected UnitAbilitiesChanged(entity: Unit) {
		if (entity instanceof Hero) {
			this.heroes.UnitAbilitiesChanged(entity)
		}
		if (entity instanceof SpiritBear) {
			this.bears.UnitAbilitiesChanged(entity)
		}
	}

	protected UnitItemsChanged(entity: Unit) {
		if (entity instanceof Hero) {
			this.heroes.UnitItemsChanged(entity)
		}
		if (entity instanceof SpiritBear) {
			this.bears.UnitItemsChanged(entity)
		}
	}

	protected GameStateChanged(newState: DOTAGameState) {
		this.runes.GameStateChanged(newState)
		this.towers.GameStateChanged(newState)
		this.customRadius.GameStateChanged(newState)
	}

	protected UnitPropertyChanged(entity: Unit) {
		if (entity instanceof Hero) {
			this.heroes.UnitPropertyChanged(entity)
		}
		if (entity instanceof SpiritBear) {
			this.bears.UnitPropertyChanged(entity)
		}
	}

	protected AbilityLevelChanged(entity: Ability) {
		this.bears.AbilityLevelChanged(entity)
		this.heroes.AbilityLevelChanged(entity)
	}

	protected GameEnded() {
		this.customRadius.GameEnded()
	}

	protected GameStarted() {
		this.customRadius.GameStarted()
	}

	protected MenuChanged(eventType: EMenuType, unit?: Unit) {
		switch (eventType) {
			case EMenuType.Towers:
				this.towers.MenuChanged()
				break
			case EMenuType.Bear:
				this.bears.MenuChanged()
				break
			case EMenuType.Runes:
				this.runes.MenuChanged()
				break
			case EMenuType.Heroes:
				this.heroes.MenuChanged(unit)
				break
			case EMenuType.Custom:
				this.customRadius.MenuChanged()
				break
			default: {
				this.updateByBaseMenu(unit)
				break
			}
		}
	}

	private updateByBaseMenu(unit?: Unit) {
		this.bears.MenuChanged()
		this.towers.MenuChanged()
		this.runes.MenuChanged()
		this.heroes.MenuChanged(unit)
		this.customRadius.MenuChanged()
	}
})()
