"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Verifier__factory_1 = require("../../typechain/factories/Verifier__factory");
const Verifier2__factory_1 = require("../../typechain/factories/Verifier2__factory");
const Verifier3__factory_1 = require("../../typechain/factories/Verifier3__factory");
const Verifier4__factory_1 = require("../../typechain/factories/Verifier4__factory");
const Verifier5__factory_1 = require("../../typechain/factories/Verifier5__factory");
const Verifier6__factory_1 = require("../../typechain/factories/Verifier6__factory");
// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains all verifiers)
class Verifier {
    constructor(contract, signer) {
        this.signer = signer;
        this.contract = contract;
    }
    // Deploys a Verifier contract and all auxiliary verifiers used by this verifier
    static async createVerifier(signer) {
        const v2Factory = new Verifier2__factory_1.Verifier2__factory(signer);
        const v2 = await v2Factory.deploy();
        await v2.deployed();
        const v3Factory = new Verifier3__factory_1.Verifier3__factory(signer);
        const v3 = await v3Factory.deploy();
        await v3.deployed();
        const v4Factory = new Verifier4__factory_1.Verifier4__factory(signer);
        const v4 = await v4Factory.deploy();
        await v4.deployed();
        const v5Factory = new Verifier5__factory_1.Verifier5__factory(signer);
        const v5 = await v5Factory.deploy();
        await v5.deployed();
        const v6Factory = new Verifier6__factory_1.Verifier6__factory(signer);
        const v6 = await v6Factory.deploy();
        await v6.deployed();
        const factory = new Verifier__factory_1.Verifier__factory(signer);
        const verifier = await factory.deploy(v2.address, v3.address, v4.address, v5.address, v6.address);
        await verifier.deployed();
        const createdVerifier = new Verifier(verifier, signer);
        return createdVerifier;
    }
}
exports.default = Verifier;
//# sourceMappingURL=Verifier.js.map