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

const bootstrap = new (class CRadiuses {
	private readonly menu = new MenuManager()
	private readonly pSDK = new ParticlesSDK()

	private readonly bears = new BearManager(this.menu, this.pSDK)
	private readonly runes = new RuneManager(this.menu, this.pSDK)
	private readonly heroes = new HeroManager(this.menu, this.pSDK)
	private readonly towers = new TowerManager(this.menu, this.pSDK)
	private readonly customRadius = new CustomRadiusManager(this.menu, this.pSDK)

	protected get State() {
		return this.menu.State.value
	}

	protected get IsPostGame() {
		return (
			GameRules === undefined ||
			GameRules.GameState === DOTAGameState.DOTA_GAMERULES_STATE_POST_GAME
		)
	}

	protected get IsUIGame() {
		return GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
	}

	public Draw() {
		if (!this.State || this.IsPostGame) {
			return
		}
		if (this.IsUIGame) {
			this.heroes.Draw()
			this.towers.Draw()
		}
	}

	public EntityCreated(entity: Entity) {
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

	public EntityDestroyed(entity: Entity) {
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

	public LifeStateChanged(entity: Entity) {
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

	public UnitAbilitiesChanged(entity: Unit) {
		if (entity instanceof Hero) {
			this.heroes.UnitAbilitiesChanged(entity)
		}
		if (entity instanceof SpiritBear) {
			this.bears.UnitAbilitiesChanged(entity)
		}
	}

	public UnitItemsChanged(entity: Unit) {
		if (entity instanceof Hero) {
			this.heroes.UnitItemsChanged(entity)
		}
		if (entity instanceof SpiritBear) {
			this.bears.UnitItemsChanged(entity)
		}
	}

	public GameStateChanged(newState: DOTAGameState) {
		this.runes.GameStateChanged(newState)
		this.towers.GameStateChanged(newState)
		this.customRadius.GameStateChanged(newState)
	}

	public UnitPropertyChanged(entity: Unit) {
		if (entity instanceof Hero) {
			this.heroes.UnitPropertyChanged(entity)
		}
		if (entity instanceof SpiritBear) {
			this.bears.UnitPropertyChanged(entity)
		}
	}

	public AbilityLevelChanged(entity: Ability) {
		this.bears.AbilityLevelChanged(entity)
		this.heroes.AbilityLevelChanged(entity)
	}

	public GameEnded() {
		this.customRadius.GameEnded()
	}

	public GameStarted() {
		this.customRadius.GameStarted()
	}

	public MenuChanged(eventType: EMenuType, unit?: Unit) {
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
				this.UpdateByBaseMenu(unit)
				break
			}
		}
	}

	private UpdateByBaseMenu(unit?: Unit) {
		this.bears.MenuChanged()
		this.towers.MenuChanged()
		this.runes.MenuChanged()
		this.heroes.MenuChanged(unit)
		this.customRadius.MenuChanged()
	}
})()

EventsSDK.on("Draw", () => bootstrap.Draw())

EventsSDK.on("GameEnded", () => bootstrap.GameEnded())

EventsSDK.on("GameStarted", () => bootstrap.GameStarted())

EventsSDK.on("EntityCreated", entity => bootstrap.EntityCreated(entity))

EventsSDK.on("EntityDestroyed", entity => bootstrap.EntityDestroyed(entity))

EventsSDK.on("LifeStateChanged", entity => bootstrap.LifeStateChanged(entity))

EventsSDK.on("GameStateChanged", state => bootstrap.GameStateChanged(state))

EventsSDK.on("UnitItemsChanged", entity => bootstrap.UnitItemsChanged(entity))

EventsSDK.on("UnitPropertyChanged", unit => bootstrap.UnitPropertyChanged(unit))

EventsSDK.on("AbilityLevelChanged", ability => bootstrap.AbilityLevelChanged(ability))

EventsSDK.on("UnitAbilitiesChanged", entity => bootstrap.UnitAbilitiesChanged(entity))

RadiusesEvents.on("MenuChanged", (eventType, unit) =>
	bootstrap.MenuChanged(eventType, unit)
)
