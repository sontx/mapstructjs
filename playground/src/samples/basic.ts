import { MapMethod, ObjectMapperFactory } from '@sontx/mapstructjs';

class ObjectMapper {
  @MapMethod({
    // map all properties in this list to target object
    properties: [
      'name',
      'age',
      ['companyName', 'company.name'],
      { target: 'companyRank', source: 'company.rank.number' },
    ],
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
