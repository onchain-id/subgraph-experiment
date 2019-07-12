![The Graph](./investorid_logo-small.png) ![The Graph](./graph_logo.svg)

# InvestorID SubGraph for OpenGraph Protocol

An [OpenGraph](https://thegraph.com/) protococol [SubGraph](https://thegraph.com/docs/define-a-subgraph) for [Blockchain Identities](https://github.com/ethereum/EIPs/issues/735) following the [InvestorID standard](https://investorid.org/).

## Usage

- First and foremost, you need to have a running ethereum network on your machine (or anywhere else, you may use the mainnet).
  - Install Ganache/Parity/whatever to run a local ethereum network or decide to use an existing network.
- Then, local running Graph node is required. The recommended installation method is to use the official docker-compose file.
  - Clone the official graph-node repository `git clone https://github.com/graphprotocol/graph-node`
  - `cd docker`
  - Replace the `ethereum` environment variable of `docker-compose.yaml` by the endpoint of the network.
  - Run the docker-compose setup `docker-compose up`
  - 🎉
