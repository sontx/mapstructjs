import { MapMethod, Mapping, ObjectMapperFactory, Property } from '@sontx/mapstructjs';

// fields are annotated with @Property will be implicit mapped with source
class Target {
  @Property()
  name: string;

  @Property()
  age: number;

  @Property()
  companyName: string;

  @Property()
  companyRank: number;
}

class ObjectMapper {
  @Mapping({ target: 'companyName', source: 'company.name' })
  @Mapping({ target: 'companyRank', source: 'company.rank' })
  @MapMethod({ targetType: Target })
  toDto: (source: any) => Target;
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
