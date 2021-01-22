var DegreeVerification = artifacts.require("./DegreeVerification.sol");

module.exports = function(deployer) {
    deployer.deploy(DegreeVerification);
};