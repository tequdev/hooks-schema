import type { Field } from 'schema'

export const PetModel: Field[] = [
  {
    type: 'VarString',
    name: 'Name',
    byte_length: 32,
    length_prefix: true,
  },
  {
    type: 'UInt64',
    name: 'ID',
  },
  {
    type: 'UInt8',
    name: 'Gender',
  },
  {
    type: 'UInt8',
    name: 'Age',
  },
  {
    type: 'UInt8',
    name: 'Breed',
  },
  {
    type: 'UInt8',
    name: 'Size',
  },
  {
    type: 'UInt8',
    name: 'Body',
  },
  {
    type: 'UInt8',
    name: 'Hooves',
  },
  {
    type: 'UInt8',
    name: 'Speed',
  },
  {
    type: 'UInt8',
    name: 'Stamina',
  },
  {
    type: 'UInt8',
    name: 'Temperament',
  },
  {
    type: 'UInt8',
    name: 'Training',
  },
  {
    type: 'UInt8',
    name: 'Health',
  },
  {
    type: 'UInt8',
    name: 'Lifespan',
  },
  {
    type: 'UInt8',
    name: 'Affinity',
  },
  {
    type: 'UInt64',
    name: 'Morale',
  },
  {
    type: 'UInt8',
    name: 'IsBreedable',
  },
  {
    type: 'XFL',
    name: 'BreedPrice',
  },
  {
    type: 'Hash256',
    name: 'TokenID',
  },
  {
    type: 'UInt64',
    name: 'Wins',
  },
  {
    type: 'XFL',
    name: 'Total',
  },
]
