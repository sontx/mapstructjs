import { Inject, MapMethod, Mapping, ObjectMapperFactory } from '@sontx/mapstructjs';

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

const objectMapperFactory = new ObjectMapperFactory();

class DecoratedUppercaseService extends UppercaseService {
  uppercase(st: string): string {
    return `[${super.uppercase(st)}]`;
  }
}

// you can provide an instance or a factory to resolve service on demand
objectMapperFactory.options.instanceResolver?.register(UppercaseService, () => new DecoratedUppercaseService());

const objectMapper = objectMapperFactory.create(ObjectMapper);

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
