import { AfterMapping, Inject, MapMethod, MappingContext, ObjectMapperFactory } from '@sontx/mapstructjs';

class WelcomeService {
  welcome(name: string) {
    return `welcome ${name}`;
  }
}

class ObjectMapper {
  @Inject(WelcomeService)
  private welcomeService: WelcomeService;

  @MapMethod({
    properties: ['name', 'age'],
  })
  toDto: (source: any) => any;

  @AfterMapping()
  after(context: MappingContext) {
    return {
      ...context.target,
      name: this.welcomeService.welcome(context.target.name),
    };
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
