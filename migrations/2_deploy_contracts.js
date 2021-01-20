var TodoList = artifacts.require("./DegreeVerification.sol");

module.exports = function(deployer) {
    deployer.deploy(TodoList);
};