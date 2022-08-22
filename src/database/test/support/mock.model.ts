export abstract class MockModel<T> {
    protected abstract entityStub: T

    constructor(createEntityData: T) {
        this.constructorSpy(createEntityData)
    }

    constructorSpy(_createEntityData: T): void {
    }

    findOne(): T {
        return this.entityStub
    }

    aggregate(): T[] {
        return [this.entityStub]
    }

    async save(): Promise<T> {
        return this.entityStub
    }
}
