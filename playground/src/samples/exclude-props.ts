import { MapMethod, ObjectMapperFactory } from '@sontx/mapstructjs';

class ObjectMapper {
  @MapMethod({
    // map all properties from source to target but excluding the list bellow
    excludes: ['company'],
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
