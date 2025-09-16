// Entwurfsklasse zur Verwaltung von Entwürfen
class DraftManager {
    private drafts: string[];

    constructor() {
        this.drafts = [];
    }

    addDraft(draft: string) {
        this.drafts.push(draft);
    }

    getDrafts() {
        return this.drafts;
    }

    removeDraft(index: number) {
        if (index > -1 && index < this.drafts.length) {
            this.drafts.splice(index, 1);
        }
    }
}

// Beispielverwendung der DraftManager-Klasse
const draftManager = new DraftManager();
draftManager.addDraft('Erster Entwurf');