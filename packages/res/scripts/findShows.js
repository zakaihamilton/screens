var me = me, object = object;

async function run() {
    debugger;
    let shows = [];
    let catalogs = await me.core.json.get("http://localhost:8085/curationchoreographer/staticdata/catalogs");
    for (let catalog of catalogs) {
        if (!catalog.catalogKey) {
            continue;
        }
        me.widget.toast.show("findShows", catalog.catalogKey);
        let categories = await me.core.json.get("http://localhost:8085/curationchoreographer/categorytree?catalogKey=" + catalog.catalogKey);
        let iterate = async (parent) => {
            for (let child of parent.children) {
                let items = await me.core.json.get("http://localhost:8085/curationchoreographer/categories/" + child.classificationId + "/content?classifTermRef=" + child.classifTermRef + "&limit=25&collapse=true&catalogId=" + catalog.catalogKey);
                if (!Array.isArray(items)) {
                    continue;
                }
                for (let item of items) {
                    if (item.objectType === "show") {
                        shows.push({ catalog: catalog.catalogKey, classificationId: child.classificationId, item });
                    }
                }
                if (child.children) {
                    await iterate(child);
                }
            }
        };
        if (categories.length) {
            let category = categories[0];
            await iterate(category.classificationNode);
        }
    }
    me.output(object, "shows.json", JSON.stringify(shows), true);
}

run();