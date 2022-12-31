/**
 *  Marks a method to be invoked at the end of mapping flow.
 *  You can change the some target's properties or even return a new target object.
 */

import { AfterMapping, MapMethod, MappingContext, ObjectMapperFactory } from '@sontx/mapstructjs';

class ObjectMapper {
  @MapMethod({
    properties: ['name', 'age', ['companyName', 'company.name'], ['companyRank', 'company.rank.number']],
  })
  toDto: (source: any) => any;

  @MapMethod({
    properties: ['name', 'age'],
  })
  toDto1: (source: any) => any;

  // will be invoked if call any map methods
  @AfterMapping()
  afterAll(context: MappingContext) {
    console.log('After each mapping:', JSON.parse(JSON.stringify(context.target)));
    context.target.name = 'Hello ' + context.target.name;
  }

  // will be invoked only if toDto1 is called
  @AfterMapping('toDto1')
  after_toDto1(context: MappingContext) {
    console.log('After toDto1 called:', JSON.parse(JSON.stringify(context.target)));
  }
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

const staffDto1 = objectMapper.toDto(staffEntity);
console.log(staffDto1);

const staffDto2 = objectMapper.toDto1(staffEntity);
console.log(staffDto2);
