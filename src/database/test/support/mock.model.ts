export abstract class MockModel<T> {
    protected abstract entityStub: T

    constructor(createEntityData: T) {
        this.constructorSpy(createEntityData)
    }

    constructorSpy(_createEntityData: T): void {
    }

    findOne(): { exec: () => T } {
        return {
            exec: (): T => this.entityStub
        }
    }

    find(): { exec: () => T[] } {
        return {
            exec: (): T[] => [this.entityStub]
        }
    }

    async save(): Promise<T> {
        return this.entityStub
    }
}