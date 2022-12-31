import { MapMethod, ObjectMapperFactory } from '@sontx/mapstructjs';

class ObjectMapper {
  @MapMethod({
    properties: ['name', 'age', ['companyName', 'company.name'], ['companyRank', 'company.rank.number']],
    // before mapping source to target, the target object must be created, if you don't supply a targetFactoryFn,
    // an empty object will be assigned for the target.
    targetFactoryFn: () => ({
      gender: 'male',
      address: 'mars',
    }),
  })
  toDto: (source: any) => any;
}

const objectMapper = new ObjectMapperFactory().create(ObjectMapper);

const staffEntity = {
  name: 'son',
  age: 20,
  company: {
    name: 'fsoft',
    rank: {
      number: 10,
      type: 'good',
    },
  },
};

const staffDto = objectMapper.toDto(staffEntity);
console.log(staffDto);
