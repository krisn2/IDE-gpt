import { Button, Menu, Portal, Box, Text } from "@chakra-ui/react";

import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);

const ACTIVE_COLOR = "blue.400";

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <Box ml={2} mb={4}>
      <Text mb={2} fontSize="lg">
        Language:
      </Text>
      <Menu.Root isLazy>
        <Menu.Trigger asChild>
          <Button variant="outline" size="sm">
            {language}
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner bg="#110c1b">
            <Menu.Content>
              {languages.map(([lang, version]) => (
                <Menu.Item
                  key={lang}
                  color={lang === language ? ACTIVE_COLOR : ""}
                  bg={lang === language ? "gray.900" : "transparent"}
                  _hover={{
                    bg: "gray.900",
                    color: ACTIVE_COLOR,
                  }}
                  onClick={() => onSelect(lang)}
                >
                  {lang}
                  &nbsp;
                  <Text as="span" fontSize="sm" color="gray.600">
                    {version}
                  </Text>
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  );
};

export default LanguageSelector;