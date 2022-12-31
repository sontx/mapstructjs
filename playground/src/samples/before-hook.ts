import { BeforeMapping, MapMethod, MappingContext, ObjectMapperFactory } from '@sontx/mapstructjs';

class ObjectMapper {
  @MapMethod({
    properties: ['name', 'age', ['companyName', 'company.name'], ['companyRank', 'company.rank.number']],
  })
  toDto: (source: any) => any;

  @BeforeMapping()
  before(context: MappingContext) {
    console.log('Before mapping', {
      source: context.source,
      target: JSON.parse(JSON.stringify(context.target)),
    });
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

const staffDto = objectMapper.toDto(staffEntity);
console.log(staffDto);
