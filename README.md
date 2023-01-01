## mapstructjs
[![CI](https://github.com/sontx/mapstructjs/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/sontx/mapstructjs/actions/workflows/main.yml)
[![npm version](https://badge.fury.io/js/@sontx%2Fmapstructjs.svg)](https://badge.fury.io/js/@sontx%2Fmapstructjs)

Multi-layered applications often require mapping between different object models (e.g. entities and DTOs).
Writing such mapping code is a tedious and error-prone task.
**mapstructjs** aims at simplifying this work by automating it as much as possible.

A playground where you can see all samples and modify code to see how it works: [mapstructjs playground](https://www.sontx.dev/mapstructjs/)

## Installation

```bash
npm install --save @sontx/mapstructjs
```

## Usage

Let's assume we have a class representing staffs (e.g. an entity) and an accompanying data transfer object (DTO).

Both types are rather similar, only the company name and company rank properties are from the nested object.

```ts
// staff.entity.ts
class StaffEntity {
  name: string;
  age: number;
  comapny: {
    name: string;
    rank: {
      number: number;
      type: string;
    }
  }
}
```
```ts
// staff.dto.ts
class StaffDto {
  name: string;
  age: number;
  companyName: string;
  companyRank: number;
}
```

### Basic usage

1. Define an object mapper
```ts
class ObjectMapper {
  @MapMethod({
    properties: [
      // map target's name prop with source's name prop
      'name',
      'age',
      // map target's companyName prop with source's 'company -> name' prop
      ['companyName', 'company.name'],
      // map target's companyRank prop with source's 'company -> rank -> number' prop
      { target: 'companyRank', source: 'company.rank.number' },
    ],
  })
  toDto: (source: any) => any;// the implementation for this method will be injected by the library
}
```

2. Create object mapper instance by using `ObjectMapperFactory`
```ts
const objectMapper = new ObjectMapperFactory().create(ObjectMapper);
```

3. Mapping source to target
```ts
const staffEntity: StaffEntity = {
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
```
4. The staffDto value will be
```json
{
 "name": "son",
 "age": 20,
 "companyName": "fsoft",
 "companyRank": 10
}
```

### Mapping with @Property annotation
Fields that are annotated with `@Property` will be mapped from the source automatically,
for unknown field names you have to specify the appropriate source property by using `@Mapping`.

1. Define target class
```ts
class StaffDto {
  @Property()
  name: string;

  @Property()
  age: number;

  @Property()// there is no matched prop name in the source, so we have to use @Mapping for this field
  companyName: string;

  @Property()
  companyRank: number;
}
```
2. Define object mapper
```ts
class ObjectMapper {
  @Mapping({ target: 'companyName', source: 'company.name' })
  @Mapping({ target: 'companyRank', source: 'company.rank' })
  @MapMethod({ targetType: StaffDto })
  toDto: (source: any) => StaffDto;
}
```
3. The rest steps will look like the above steps

### Transform fields
You can customize transforming the source's prop to the target's prop by defining `transform` in `@Mapping`.

All steps look like the above, but step 2.
```ts
class ObjectMapper {
  @Mapping({ target: 'companyName', transform: (_, context) => `Company is ${context.source.company.name}`})
  @Mapping({ target: 'companyRank', source: 'company.rank' })
  @MapMethod({ targetType: StaffDto })
  toDto: (source: any) => StaffDto;
}
```
The output
```json
{
 "name": "son",
 "age": 20,
 "companyName": "Company is fsoft",
 "companyRank": 10
}
```

### Link with other object mappers

Let's assume we have **mapper1** that can map a company entity to its dto,
and **mapper2** has a mapping property that also needs to map a company entity to dto. 
To reuse these types of logic, we can "link" **mapper1** to **mapper2**,
the library will look up the correct map method while mapping each property by its source and target type.

1. Define entities and DTOs
```ts
// company.entity.ts
class CompanyEntity {
  name: string;
  rank: {
    number: number;
    type: string;
  };
}

// staff.entity.ts
class StaffEntity {
  @Property()
  name: string;

  @Property()
  age: number;

  @Property(CompanyEntity)
  company: CompanyEntity;
}

// company.dto.ts
class CompanyDto {
  name: string;
  rank: number;
}

// staff.dto.ts
class StaffDto {
  @Property()
  name: string;

  @Property()
  age: number;

  @Property(CompanyDto)
  company: CompanyDto;
}
```

2. Define object mapper for mapping company entity to its dto
```ts
class CompanyObjectMapper {
  @Mapping({ target: 'name' })
  @Mapping({ target: 'rank', source: 'rank.number' })
  @MapMethod({ targetType: CompanyDto, sourceType: CompanyEntity })
  toDto: (source: CompanyEntity) => CompanyDto;
}
```

3. Define object mapper for mapping staff entity to its dto
```ts
// we link this object mapper to the company object mapper,
// so the library can lookup to find the best suitable mapping method for mapping company
@Mapper([CompanyObjectMapper])
class ObjectMapper {
  @MapMethod({ targetType: StaffDto, sourceType: StaffEntity })
  toDto: (source: StaffEntity) => StaffDto;
}
```

The output
```json lines
{
  "name": "son",
  "age": 20,
  // this result is from CompanyObjectMapper.dto
  "company": {
    "rank": 10,
    "name": "fsoft"
  }
}
```

### Link with other services
Let's assume we have a `WelcomeService` that needs to call while mapping our staff's name.

```ts
class WelcomeService {
  welcome(name: string) {
    return `Welcome ${name}`;
  }
}
```

Inject this service into the object mapper
```ts
class ObjectMapper {
  // this service instance will be resolved when the object mapper is created
  @Inject(WelcomeService)
  private welcomeService: WelcomeService;

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
```

The output
```json
{
  "name": "Welcome son",
  "age": 20
}
```

If you want to handle creating `WelcomeService`, call this one before `objectMapperFactory.create`
```ts
objectMapperFactory.options.instanceResolver?.register(WelcomeService, () => new WelcomeService());
```

### After and before hooks
The mapping flow will look like: create context (1) -> call before hook (2) -> do map -> call after hook (3) -> return target (4)

1. Mapping context is created, target object is also created in this phase.
2. Call all matched **before hooks**.
3. Map source object to target object, custom `transform` will be called in this phase.
4. Call all matched **after hooks**, you can overwrite the return target value in this hook (only the first override is accepted).
5. Return the final target object, this can be the created object in step 1 or the overwritten object in step 4.

Hooks are defined in the object mapper class
```ts
class ObjectMapper {
  // .....map methods.....

  @BeforeMapping()
  before(context: MappingContext) {
    console.log('Before mapping');
  }

  @AfterMapping()
  after(context: MappingContext) {
    console.log('After mapping');
    // overwrite the target value
    return {
      name: 'noem',
      age: 19
    }
  }
}
```

You can use injected services inside hooks
```ts
class ObjectMapper {
  @Inject(WelcomeService)
  private welcomeService: WelcomeService;

  // .....map methods.....

  @AfterMapping()
  after(context: MappingContext) {
    return {
      ...context.target,
      name: this.welcomeService.welcome(context.target.name),
    };
  }
}
```
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


## Contact

Tran Xuan Son - [@sontx0](https://twitter.com/sontx0) - xuanson33bk@gmail.com

## Acknowledgments

Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!

* [Choose an Open Source License](https://choosealicense.com)
* [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)
* [Malven's Flexbox Cheatsheet](https://flexbox.malven.co/)
* [Malven's Grid Cheatsheet](https://grid.malven.co/)
* [Img Shields](https://shields.io)
* [GitHub Pages](https://pages.github.com)
* [Font Awesome](https://fontawesome.com)
* [React Icons](https://react-icons.github.io/react-icons/search)
