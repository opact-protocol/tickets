import { createMock } from "@golevelup/ts-jest";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "./configuration";

const accessNestedProp =
  <T>(obj: T) =>
  (path: string) => {
    const props = path.split(".");
    let acc = obj;
    for (const prop of props) {
      acc = acc[prop];
    }
    return acc;
  };

export function configServicePartialMock<T extends keyof Configuration>(
  mockPath: T,
  partialConfigMock: Partial<Configuration[T]>
) {
  const configServiceMock = createMock<ConfigService<Configuration>>();

  const configMock = { [mockPath]: partialConfigMock };
  configServiceMock.get.mockImplementation(accessNestedProp(configMock));

  return {
    provide: ConfigService,
    useValue: configServiceMock,
  };
}

export function configServiceMock(configMock: Configuration) {
  const configServiceMock = createMock<ConfigService<Configuration>>();

  configServiceMock.get.mockImplementation(accessNestedProp(configMock));

  return configServiceMock;
}
