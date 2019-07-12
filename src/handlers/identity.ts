import {
  KeyAdded as KeyAddedEvent,
  KeyRemoved as KeyRemovedEvent,
} from '../../generated/Identity/Identity';

import {
  Identity,
  Key,
} from '../../generated/schema';

import { Bytes, Address } from "@graphprotocol/graph-ts";

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
    key.purposes = [event.params.purpose.toI32()];

    key.save();

    identity.save();
  } else {
    key.purposes.push(event.params.purpose.toI32());

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

  let keyIndex = key.purposes.indexOf(event.params.purpose.toI32());
  if (keyIndex == -1) {
    return;
  }
  key.purposes.splice(keyIndex, 1);

  key.save();
}

function createKeyID(identity: Address, key: Bytes): string {
  return identity.toHexString().concat('-').concat(key.toHexString());
}
