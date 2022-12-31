/**
 * In case you have many different object mappers, one can be used by the others.
 *
 * Ex: mapper1 can map a company entity to its dto, and mapper2 has a mapping property that also needs to map
 * a company entity to dto. To reuse these types of logic, we can "link" mapper1 to mapper2, the library
 * will look up the correct map method while mapping each property by its source and target type.
 */


import { MapMethod, Mapper, Mapping, ObjectMapperFactory, Property } from '@sontx/mapstructjs';

class CompanyEntity {
  name: string;
  rank: {
    number: number;
    type: string;
  };
}

class CompanyDto {
  name: string;
  rank: number;
}

class StaffEntity {
  @Property()
  name: string;

  @Property()
  age: number;

  @Property(CompanyEntity)
  company: CompanyEntity;
}

class StaffDto {
  @Property()
  name: string;

  @Property()
  age: number;

  @Property(CompanyDto)
  company: CompanyDto;
}

class CompanyObjectMapper {
  @Mapping({ target: 'name' })
  @Mapping({ target: 'rank', source: 'rank.number' })
  @MapMethod({ targetType: CompanyDto, sourceType: CompanyEntity })
  toDto: (source: CompanyEntity) => CompanyDto;
}

@Mapper([CompanyObjectMapper])
class ObjectMapper {
  @MapMethod({ targetType: StaffDto, sourceType: StaffEntity })
  toDto: (source: StaffEntity) => StaffDto;
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
