function migrateActorData(actor) {
    let updateData = {};

    console.log(actor);
    if (actor.fatigue) {
        updateData["system.fatigue.value"] = actor.fatigue.actual;
    }
    if (actor.kiPool) {
        updateData["system.unifiedKi.value"] = actor.kiPool.unified;
    }
    if (actor.zeon) {
        updateData["system.zeon.value"] = actor.zeon.actual;
    }
    if (actor.ppoint) {
        updateData["system.psychicPoint.value"] = actor.ppoint.freepp;
    }
    if (actor.innate) {
        updateData["system.innatePowerKi.value"] = actor.innate.actual;
    }
    return updateData;
}

function migrateSceneData(scene) {
    const tokens = scene.tokens.map(token => {
        const t = token.toJSON();

        if (!t.actorLink) {
            const actor = duplicate(t.delta);
            actor.type = t.actor?.type;
            const update = migrateActorData(actor);
            mergeObject(t.delta, update);
        }
        return t;
    });

    return { tokens };
}

export async function migrateWorld() {
    for (let actor of game.actors.contents) {
        const updateData = migrateActorData(actor.system);
        if (!foundry.utils.isEmpty(updateData)) {
            console.log(`Migrating Actor entity ${actor.name}`);
            await actor.update(updateData);
        }
    }

    for (let scene of game.scenes.contents) {
        let sceneUpdate = migrateSceneData(scene)
        if (!foundry.utils / isEmpty(sceneUpdate)) {
            console.log(`Migrating Scene ${scene.name}`);
            await scene.update(sceneUpdate);
        }
    }
    for (let pack of game.packs) {
        const packType = pack.metadata.entity;
        if (!["Actor", "Scene"].includes(packType)) {
            continue;
        }

        const wasLocked = pack.locked;
        await pack.configure({ locked: false });

        await pack.migrate();
        const documents = await pack.getDocuments();

        for (let document of documents) {
            let updateData = {};
            switch (packType) {
                case "Actor":
                    updateData = migrateActorData(document.data);
                    break;
                case "Scene":
                    updataData = migrateSceneData(document.scene);
                    break;
            }
            if (foundry.utils.isObjectEmpty(updateData)) {
                continue;
            }
            await document.update(updataData);
            console.log(`Migrated ${packType} entity ${document.name} in Compendium ${pack.collection}`);
        }

        await pack.configue({ locked: wasLocked });
    }
    console.log("Migration Complete");
    game.settings.set('abfalter', 'systemMigrationVersion', game.system.version);
}
