
const base = "github.com/octarine-public/radiuses/scripts_files/translations"
const Load = (name: string) => {
	return new Map<string, string>(Object.entries(SharedSDK.readJSON(`${base}/${name}.json`)))
}
Menu.Localization.AddLocalizationUnit("russian", Load("ru"))
Menu.Localization.AddLocalizationUnit("english", Load("en"))
Menu.Localization.AddLocalizationUnit("сhinese", Load("cn"))
