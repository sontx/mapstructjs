/**
 * Other services can be injected into the current object mapper,
 * service instances will be resolved by their type when the first object mapper instance is created
 * and they will be cached for other requests.
 */

import { Inject, MapMethod, Mapper, Mapping, ObjectMapperFactory } from '@sontx/mapstructjs';

class WelcomeService {
  welcome(name: string) {
    return `welcome ${name}`;
  }
}
class UppercaseService {
  uppercase(st: string) {
    return st.toUpperCase();
  }
}
class DecoratedUppercaseService extends UppercaseService {
  uppercase(st: string): string {
    return `[${super.uppercase(st)}]`;
  }
}

@Mapper([DecoratedUppercaseService])
class ObjectMapper {
  @Inject(WelcomeService)
  private welcomeService: WelcomeService;

  @Inject(UppercaseService)
  private uppercaseService: UppercaseService;

  @Mapping({
    target: 'name',
    transform: (sourceValue, context) => {
      const self = context.getObjectMapper<ObjectMapper>();
      return self.welcomeService.welcome(self.uppercaseService.uppercase(sourceValue));
    },
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
