![The Graph](./investorid_logo-small.png) ![The Graph](./graph_logo.svg)

# InvestorID SubGraph for OpenGraph Protocol

An [OpenGraph](https://thegraph.com/) protococol [SubGraph](https://thegraph.com/docs/define-a-subgraph) for [Blockchain Identities](https://github.com/ethereum/EIPs/issues/735) following the [InvestorID standard](https://investorid.org/).

## Usage

- First and foremost, you need to have a running ethereum network on your machine (or anywhere else, you may use the mainnet).
  - Install Ganache/Parity/whatever to run a local ethereum network or decide to use an existing network.
- Then, local running Graph node is required. The recommended installation method is to use the official docker-compose file.
  - Clone the official graph-node repository `git clone https://github.com/graphprotocol/graph-node.git`
  - `cd docker`
  - Replace the `ethereum` environment variable of `docker-compose.yaml` by the endpoint of the network.
  - Run the docker-compose setup `docker-compose up`
  - 🎉
- Clone this repository `git clone https://github.com/tokenyICO/investori-subgraph.git`
  - Install dependencies `yarn` (or `npm i`)
  - Run `yarn run codegen`
  - Run `yarn run create-local`
  - Run `yarn run build`
  - Run `yarn run deploy-local`
 
 ## How to create a new SubGraph (quick start)
- Init a new project `npm init`
- Set up the `package.json` scripts. (Note, graph-cli might be required depending on your operating system and node configuration. If scripts commands don't work, try installing `yarn global add @graphprotocol/graph-cli`.)
  
  Update the `domain/graph-name` part to mirror the name of the SubGraph, such as `investorid/id`.
  
  ```json
  {
    "scripts": {
      "codegen": "graph codegen",
      "create-local": "graph create domain/graph-name --node http://127.0.0.1:8020",
      "build": "graph build",
      "deploy-local": "graph deploy domain/graph-name --debug --ipfs http://localhost:5001 --node http://127.0.0.1:8020/",
      "watch-local": "graph deploy domain/graph-name --watch --debug --node http://127.0.0.1:8020/ --ipfs http://localhost:5001"
    }
  }
  ```
- Install these dependencies: `yarn add --dev @graphprotocol/graph-cli @graphprotocol/graph-cli`
- Load your contract ABIs (.json files) into a `./abis` folder.
  > Instead, you may install a package containing these abis, like `yarn add --dev @investorid/solidity`. This is what was done for Identities contract loaded from the investoID solidity package.
- Create a `subgraph.yaml` file to describe the SubGraph:
  
  ```yaml
  specVersion: 0.0.3
  description: Decentralized identities over the Ethereum Blockchain.
  repository: https://github.com/investorid/investorid-subgraph
  schema:
    file: ./schema.graphql
  dataSources: []
  ```
- Create a `schema.graphql` file to describe the entities used by the SubGraph and exposed via GraphQL.
  
  ```graphql
  type Identity @entity {
    id: ID!
    address: Bytes!
    keys: [Key!]! @derivedFrom(field: "identity")
  }
  
  type Key @entity {
    id: ID!
    keyType: BigInt!
    key: Bytes!
    purposes: [Int!]!
    identity: Identity!
  }
  ```
  
  Custom types added by The Graph, such as BigInt and Bytes. The Graph's [documentation of GraphQL API](https://thegraph.com/docs/graphql-api) explains the usage of relationships and specific reverse properties such as `@derivedFrom`.
- Create a file in `.src/handlers` where the handlers will be implemented `mkdir src/handlers/identity.ts`

  Implement the event handlers (let them be no-op for now). Imports do not exist yet but will be generated, ignore any IDE error.
  
  ```typescript
  import {
    KeyAdded as KeyAddedEvent,
    KeyRemoved as KeyRemovedEvent,
  } from '../../generated/Identity/Identity';
  
  import {
    Identity,
    Key,
  } from '../../generated/schema';

  export function handleKeyAdded(event: KeyAddedEvent): void {
  
  };

  export function handleKeyRemoved(event: KeyRemovedEvent): void {
    
  };
  ```
- Declare the ABI to be used and scanned by the graph node in the `subgraph.yaml` file.  
  Any entity used by the event handlers must be declared in the `entities` property.  
  A list of all event to be scanned and handled must also be declared in the `eventHandlers` property. The `event` property must match the exact event signature contained by the ABI (if an event is not recognized an error will be thrown displaying the list of available events to help for correction).
  
  ```yaml
  dataSources:
    - kind: ethereum/contract
      name: Identity
      network: http://localhost:8545
      source:
        abi: Identity
      mapping:
        kind: ethereum/events
        apiVersion: 0.0.3
        language: wasm/assemblyscript
        file: ./src/handler/identity.ts
        entities:
          - Identity
          - Key
        abis:
          - name: Identity
            file: ./node_modules/@investorid/solidity/build/contracts/Identity.json
        eventHandlers:
          - event: KeyAdded(indexed bytes32,indexed uint256,indexed uint256)
            handler: handleKeyAdded
          - event: KeyRemoved(indexed bytes32,indexed uint256,indexed uint256)
            handler: handleKeyRemoved
  ```
- Now that some entities are defined, generate the typings and the automated code parts that will allow for developing the event handlers: `yarn run codegen`.

  The handler file `./src/handlers/identity.ts` should no longer have errors for non-existing imports.
- This is where the fun starts. Time has come to create the event handlers. Refer to [The Graph documentation, how to write mappings](https://thegraph.com/docs/define-a-subgraph#writing-mappings).
  - To create a new entity instance, call `<Entity>#create(<id>)`. The `<id>` is a string that must be generated. To be able to retrieve instances from blockchain data, the IDs should be composed of addresses, hashes, etc...
  - To load an existing entity, call `<Entity>#load(<id>)`.
  - To save a new entity or persist the update on an existing one, call `<entity>.save()`.
- Build the SubGraph with `yarn run build` ✨
- Declare the SubGraph on the local Graph node `yarn run create-local`
- Deploy the SubGraph to the local Graph node `yarn run deploy-local` (there is also a watch start that will deploy the SubGraph after each code update `yarn run watch-local`. All events will be processed again with the new updated handlers.).
- An GraphQL UI for queries is accessible at [http://127.0.0.1:8000/subgraphs/name/domain/graph-name/graphql](http://127.0.0.1:8000/subgraphs/name/domain/graph-name/graphql). 

> **IMPORTANT**: Whenever the ethereum network has been reseted (eg. Ganache restarted, computer rebooted, ...), you need to **DELETE** the `./docker/data` folder `rm -rf ./data`.  
  This is required to clean the existing database that checks the genesis block for the current ethereum network.
