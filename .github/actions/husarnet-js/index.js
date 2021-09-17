const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const cache = require("@actions/cache");

// most @actions toolkit packages have async methods
async function run() {
  try {

    const joincode = core.getInput("join-code");
    const hostname = core.getInput("hostname");

    let myOutput = "";
    let myError = "";

    const options = {};
    options.listeners = {
      stdout: (data) => {
        myOutput = data.toString();
      },
      stderr: (data) => {
        myError = data.toString();
      },
    };

    // const paths = [
    //   // `${github.}`,
    //   "packages/*/node_modules/",
    // ];
    // const key = "npm-foobar-d5ea0750";
    // const cacheId = await cache.saveCache(paths, key);

    // https://github.com/actions/toolkit/issues/346
    await exec.exec(
      `/bin/bash -c "curl https://install.husarnet.com/install.sh | sudo bash"`
    );
    await exec.exec(`/bin/bash -c "sudo systemctl restart husarnet"`);

    console.log("Waiting for Husarnet to be ready");

    do {
      await exec.exec(
        `/bin/bash -c "sudo husarnet status | grep "ERROR" | wc -l"`,
        options
      );
      setTimeout(() => { console.log("."); }, 1000);
    } while (parseInt(myOutput) > 0);
    console.log("done");

    await exec.exec(
      `/bin/bash -c "sudo husarnet status"`,
      options
    );
    console.log(myOutput.toString());

    await exec.exec(
      `sudo husarnet join ${joincode} ${hostname}`,
      options
    );
    console.log(myOutput.toString());

    
    console.log(`JoinCode of this GA: ${joincode}`);

    const ipv6 = "fc94:2283:b56b:beeb:xxxx:xxxx:xxxx:xxxx";
    core.setOutput("ipv6", ipv6);

    console.log(JSON.stringify(github, null, "\t"));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
