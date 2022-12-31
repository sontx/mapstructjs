import { MapMethod, Mapping, ObjectMapperFactory } from '@sontx/mapstructjs';

class ObjectMapper {
  // sourceValue is from source[targetPropertyName],
  // transform value will be assigned to the current target's property
  @Mapping({ target: 'name', transform: (sourceValue) => `Hello ${sourceValue}` })
  @Mapping({
    target: 'nickname',
    // you can access the whole source object from the context
    transform: (_, context) => `${context.source.name.toUpperCase()}@${context.source.age}`,
  })
  @MapMethod({
    properties: ['name', 'age'],
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
