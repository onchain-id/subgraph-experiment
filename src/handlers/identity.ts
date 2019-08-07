import { log, store, Address, Bytes } from "@graphprotocol/graph-ts";

import {
  ClaimAdded as ClaimAddedEvent,
  ClaimRemoved as ClaimRemovedEvent,
  KeyAdded as KeyAddedEvent,
  KeyRemoved as KeyRemovedEvent,
} from '../../generated/Identity/Identity';

import {
  Claim,
  Identity,
  Key,
} from '../../generated/schema';

export function handleClaimAdded(event: ClaimAddedEvent): void {
  let identity = Identity.load(event.address.toHexString());
  if (identity == null) {
    identity = new Identity(event.address.toHexString());
    identity.address = event.address;

    identity.save();
  }

  let claim = new Claim(createClaimID(event.address, event.params.claimId));
  claim.identity = identity.id;
  claim.claimID = event.params.claimId;
  claim.data = event.params.data;
  claim.topic = event.params.topic;
  claim.scheme = event.params.scheme;
  claim.signature = event.params.signature;
  claim.issuer = event.params.issuer;
  claim.uri = event.params.uri;

  claim.save();
}

export function handleClaimChanged(event: ClaimAddedEvent): void {
  let identity = Identity.load(event.address.toHexString());
  if (identity == null) {
    identity = new Identity(event.address.toHexString());
    identity.address = event.address;

    identity.save();
  }

  let claim = new Claim(createClaimID(event.address, event.params.claimId));
  claim.identity = identity.id;
  claim.claimID = event.params.claimId;
  claim.data = event.params.data;
  claim.topic = event.params.topic;
  claim.scheme = event.params.scheme;
  claim.signature = event.params.signature;
  claim.issuer = event.params.issuer;
  claim.uri = event.params.uri;

  claim.save();
}

export function handleClaimRemoved(event: ClaimRemovedEvent): void {
  let claimID = createClaimID(event.address, event.params.claimId);

  store.remove('Claim', claimID);
}

export function handleKeyAdded(event: KeyAddedEvent): void {
  let identity = Identity.load(event.address.toHexString());
  if (identity == null) {
    identity = new Identity(event.address.toHexString());
    identity.address = event.address;

    identity.save();
  }

  let key = Key.load(createKeyID(event.address, event.params.key));
  if (key == null) {
    key = new Key(createKeyID(event.address, event.params.key));

    key.identity = identity.id;
    key.key = event.params.key;
    key.keyType = event.params.keyType;
    key.purposes = [event.params.purpose];

    key.save();

    identity.save();
  } else {
    let purposes = key.purposes;
    purposes.push(event.params.purpose);
    key.purposes = purposes;

    key.save();
    identity.save();
  }
}

export function handleKeyRemoved(event: KeyRemovedEvent): void {
  let identity = Identity.load(event.address.toHexString());
  if (identity == null) {
    return;
  }

  let key = Key.load(createKeyID(event.address, event.params.key));
  if (key == null) {
    return;
  }

  let keyIndex = key.purposes.indexOf(event.params.purpose);
  if (keyIndex == -1) {
    return;
  }
  let purposes = key.purposes;
  purposes.splice(keyIndex, 1);
  key.purposes = purposes;

  if (key.purposes.length === 0) {
    store.remove('Key', key.id);
  } else {
    key.save();
  }
}

function createClaimID(identity: Address, claimID: Bytes): string{
  return identity.toHexString().concat('-').concat(claimID.toHexString());
}

function createKeyID(identity: Address, key: Bytes): string {
  return identity.toHexString().concat('-').concat(key.toHexString());
}
