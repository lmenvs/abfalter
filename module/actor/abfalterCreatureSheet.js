import { openModifierDialogue } from "../diceroller.js";

export default class abfalterCreatureSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["abfcreature", "sheet", "actor"],
            template: "systems/abfalter/templates/actor/creature-sheet.html",
            width: 900,
            height: 950,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    itemContextMenuEquip = [
        {
            name: game.i18n.localize("abfalter.sheet.equip"),
            icon: '<i class="fas fa-caret-right"></i>',
            callback: element => {
                const item = this.actor.items.get(element.data("item-id"));
                element.equipped = !item.system.equipped;
                item.update({ "data.equipped": element.equipped });
            }
        },
        {
            name: game.i18n.localize("abfalter.sheet.edit"),
            icon: '<i class="fas fa-edit"></i>',
            callback: element => {
                const item = this.actor.items.get(element.data("item-id"));
                item.sheet.render(true);
            }
        },
        {
            name: game.i18n.localize("abfalter.sheet.delete"),
            icon: '<i class="fas fa-trash"></i>',
            callback: element => {
                this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
            }
        }

    ]
    itemContextMenu = [
        {
            name: game.i18n.localize("abfalter.sheet.edit"),
            icon: '<i class="fas fa-edit"></i>',
            callback: element => {
                const item = this.actor.items.get(element.data("item-id"));
                item.sheet.render(true);
            }
        },
        {
            name: game.i18n.localize("abfalter.sheet.delete"),
            icon: '<i class="fas fa-trash"></i>',
            callback: element => {
                this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
            }
        }

    ]
    itemContextMenuDelete = [
        {
            name: game.i18n.localize("abfalter.sheet.toggle"),
            icon: '<i class="fas fa-caret-right"></i>',
            callback: element => {
                const item = this.actor.items.get(element.data("item-id"));
                element.toggleItem = !item.system.toggleItem;
                item.update({ "data.toggleItem": element.toggleItem });
            }
        },
        {
            name: game.i18n.localize("abfalter.sheet.delete"),
            icon: '<i class="fas fa-trash"></i>',
            callback: element => {
                this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
            }
        }

    ]
    itemContextMenuOnlyDelete = [
        {
            name: game.i18n.localize("abfalter.sheet.delete"),
            icon: '<i class="fas fa-trash"></i>',
            callback: element => {
                this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
            }
        }

    ]
    getData() {
        const baseData = super.getData();
        let sheetData = {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor: baseData.actor,
            data: baseData.actor.system,
            config: CONFIG.abfalter
        }

        //Initialize Items
        sheetData.inventories = baseData.items.filter(function (item) { return item.type == "inventory" });
        // sheetData.weapons = baseData.items.filter(function (item) { return item.type == "weapon" });
        // sheetData.armors = baseData.items.filter(function (item) { return item.type == "armor" });
        // sheetData.armorHelmets = baseData.items.filter(function (item) { return item.type == "armorHelmet" });
        // sheetData.advantages = baseData.items.filter(function (item) { return item.type == "advantage" });
        // sheetData.disadvantages = baseData.items.filter(function (item) { return item.type == "disadvantage" });
        sheetData.spells = baseData.items.filter(function (item) { return item.type == "spell" });
        sheetData.classes = baseData.items.filter(function (item) { return item.type == "class" });
        sheetData.spellPaths = baseData.items.filter(function (item) { return item.type == "spellPath" });
        sheetData.incarnations = baseData.items.filter(function (item) { return item.type == "incarnation" });
        sheetData.invocations = baseData.items.filter(function (item) { return item.type == "invocation" });
        sheetData.dailyMaints = baseData.items.filter(function (item) { return item.type == "dailyMaint" });
        sheetData.turnMaints = baseData.items.filter(function (item) { return item.type == "turnMaint" });
        sheetData.currencies = baseData.items.filter(function (item) { return item.type == "currency" });
        sheetData.proficiencies = baseData.items.filter(function (item) { return item.type == "proficiency" });
        sheetData.weaponAttacks = baseData.items.filter(function (item) { return item.type == "weaponAttack" });
        sheetData.disciplines = baseData.items.filter(function (item) { return item.type == "discipline" });
        sheetData.mentalPatterns = baseData.items.filter(function (item) { return item.type == "mentalPattern" });
        sheetData.psychicMatrixs = baseData.items.filter(function (item) { return item.type == "psychicMatrix" });
        sheetData.maintPowers = baseData.items.filter(function (item) { return item.type == "maintPower" });
        // sheetData.kiSealCreatures = baseData.items.filter(function (item) { return item.type == "kiSealCreature" });

        return sheetData;
    }

    activateListeners(html) {
        if (this.isEditable) {
            html.find(".item-create").click(this._onItemCreate.bind(this));
            html.find(".inline-edit").change(this._onLineItemEdit.bind(this));
            html.find(".item-edit").click(this._onItemEdit.bind(this));
            html.find(".item-delete").click(this._onItemDelete.bind(this));
            html.find(".item-expand").click(this._onItemExpand.bind(this));
            html.find(".item-toggle").click(this._onItemToggle.bind(this));

            new ContextMenu(html, ".normal-item", this.itemContextMenu);
            new ContextMenu(html, ".equip-item", this.itemContextMenuEquip);
            new ContextMenu(html, ".delete-item", this.itemContextMenuDelete);
            new ContextMenu(html, ".onlyDelete-item", this.itemContextMenuOnlyDelete);

            $("textarea").each(function () {
                this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
            }).on("input", function () {
                this.style.height = "auto";
                this.style.height = (this.scrollHeight) + "px";
            });
        }

        if (this.actor.isOwner) {
            html.find('.maccuHalf').click(ev => {
                const value = $(ev.currentTarget).attr("data-ability");
                this.document.update({ "data.maccu.actual": Math.floor(this.document.system.maccu.actual + (value / 1)) });
            });
            html.find('.maccuFull').click(ev => {
                const value = $(ev.currentTarget).attr("data-ability");
                this.document.update({ "data.maccu.actual": Math.floor(this.document.system.maccu.actual + (value / 1)) });
            });
            html.find('.mregenFull').click(ev => {
                let value = $(ev.currentTarget).attr("data-ability");
                let max = $(ev.currentTarget).attr("data-ability2");
                this.document.update({ "data.zeon.value": Math.min(Math.floor(this.document.system.zeon.value + (value / 1)), max) });
            });
            html.find('.removeMaint').click(ev => {
                let value = $(ev.currentTarget).attr("data-ability");
                this.document.update({ "data.zeon.value": Math.max(0, Math.floor(this.document.system.zeon.value - value)) });
            });
            html.find(".toggleBoolean").click(ev => {
                let value = $(ev.currentTarget).attr("data-ability");
                let label = $(ev.currentTarget).attr("data-label");
                value = !(value === 'true');
                this.document.update({ [label]: value });
            });
            html.find(".kiAbility").click(ev => {
                let value = $(ev.currentTarget).attr("data-ability");
                let value2 = $(ev.currentTarget).attr("data-ability2");
                let label = $(ev.currentTarget).attr("data-label");
                let label2 = $(ev.currentTarget).attr("data-label2");
                if (value == "false" && value2 == "false") {
                    value = true;
                    value2 = false;
                } else if (value == "true" && value2 == "false") {
                    value = true;
                    value2 = true;
                } else {
                    value = false;
                    value2 = false;
                }
                this.document.update({ [label]: value, [label2]: value2 });
            });


            html.find(".item-chat").click(this._onItemChatRoll.bind(this));

            html.find('.rollable').click(this._onRoll.bind(this));
            html.find('.combatRoll').click(this._onAttackRoll.bind(this));

        }

        super.activateListeners(html);
    }

    _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        openModifierDialogue(this.actor, dataset.roll, dataset.label, dataset.type);
    }

    _onAttackRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        openModifierDialogue(this.actor, dataset.roll, dataset.label, dataset.type, dataset.ability);
    }

    _onItemCreate(event) {
        event.preventDefault();
        let element = event.currentTarget;
        const type = element.dataset.type;

        const types = {
            // "inventory": game.i18n.localize("abfalter.sheet.inventory"),
            // "weapon": game.i18n.localize("abfalter.sheet.weapon"),
            // "armor": game.i18n.localize("abfalter.sheet.armor"),
            // "armorHelmet": game.i18n.localize("abfalter.sheet.armorHelmet"),
            // "advantage": game.i18n.localize("abfalter.sheet.advantage"),
            // "disadvantage": game.i18n.localize("abfalter.sheet.disadvantage"),
            "spell": game.i18n.localize("abfalter.sheet.spell"),
            "class": game.i18n.localize("abfalter.sheet.class"),
            "spellPath": game.i18n.localize("abfalter.sheet.spellPath"),
            "incarnation": game.i18n.localize("abfalter.sheet.incarnation"),
            "invocation": game.i18n.localize("abfalter.sheet.invocation"),
            "dailyMaint": game.i18n.localize("abfalter.sheet.dailyMaint"),
            "turnMaint": game.i18n.localize("abfalter.sheet.turnMaint"),
            "currency": game.i18n.localize("abfalter.sheet.currency"),
            "proficiency": game.i18n.localize("abfalter.sheet.proficiency"),
            "weaponAttack": game.i18n.localize("abfalter.sheet.weaponAttack"),
            "discipline": game.i18n.localize("abfalter.sheet.discipline"),
            "mentalPattern": game.i18n.localize("abfalter.sheet.mentalPattern"),
            "psychicMatrix": game.i18n.localize("abfalter.sheet.psychicMatrix"),
            "maintPower": game.i18n.localize("abfalter.sheet.maintPower"),
            "kiSealCreature": game.i18n.localize("abfalter.sheet.kiSealCreature"),
            "kiTechnique": game.i18n.localize("abfalter.sheet.kiTechnique"),
            "martialArt": game.i18n.localize("abfalter.sheet.martialArt"),
            "arsMagnus": game.i18n.localize("abfalter.sheet.arsMagnus"),
            "default": game.i18n.localize("abfalter.sheet.newItem"),
        };
        const name = (types[type] || types["default"]);
        let itemData = {
            name: name,
            type: element.dataset.type
        }
        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    _onItemEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);

        item.sheet.render(true);
    }

    _onItemDelete(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    }

    _onLineItemEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let field = element.dataset.field;
        return item.update({ [field]: element.value });
    }

    _onItemExpand(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        element.expand = !item.system.expand;
        item.update({ "data.expand": element.expand });
    }

    _onItemToggle(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let value = $(event.currentTarget).attr("data-ability");
        let label = $(event.currentTarget).attr("data-label");
        value = !(value === 'true');
        item.update({ [label]: value });
    }

    _onItemChatRoll(event) {
        event.preventDefault();
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemID);
        let label = $(event.currentTarget).attr("data-label");

        item.roll(label);
    }


}

