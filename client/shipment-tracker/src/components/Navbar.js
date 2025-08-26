import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Container,
  Image,
  Text,
  Collapse,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTruck, FaShieldAlt, FaPhone, FaUser } from 'react-icons/fa';

const MotionBox = motion(Box);

const NavLink = ({ children, to, icon }) => (
  <Link
    as={RouterLink}
    to={to}
    px={3}
    py={2}
    rounded="md"
    color="white"
    fontWeight="500"
    fontSize="sm"
    position="relative"
    _hover={{
      textDecoration: 'none',
      color: 'brand.200',
      transform: 'translateY(-1px)',
    }}
    transition="all 0.2s"
    display="flex"
    alignItems="center"
    gap={2}
  >
    {icon}
    {children}
  </Link>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <MotionBox
      bg="navy.800"
      px={4}
      py={2}
      boxShadow="lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxW="7xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo Section */}
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <HStack spacing={3}>
              <MotionBox
                p={2}
                bg="brand.500"
                rounded="lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTruck color="white" size="24" />
              </MotionBox>
              <Box>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="white"
                  lineHeight="1"
                >
                  SHANU
                </Text>
                <Text
                  fontSize="sm"
                  color="brand.200"
                  lineHeight="1"
                  fontWeight="500"
                >
                  COURIER SERVICES
                </Text>
              </Box>
            </HStack>
          </Link>

          {/* Desktop Navigation */}
          <HStack
            as="nav"
            spacing={6}
            display={{ base: 'none', md: 'flex' }}
            alignItems="center"
          >
            <NavLink to="/track" icon={<FaTruck size="14" />}>
              Track Package
            </NavLink>
            <NavLink to="/about" icon={<FaShieldAlt size="14" />}>
              About Us
            </NavLink>
            <NavLink to="/contact" icon={<FaPhone size="14" />}>
              Contact
            </NavLink>
            
            {isAuthenticated ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  color="white"
                  rightIcon={<ChevronDownIcon />}
                  _hover={{ bg: 'navy.700' }}
                  _active={{ bg: 'navy.700' }}
                >
                  <FaUser size="14" />
                </MenuButton>
                <MenuList bg="white" borderColor="gray.200">
                  <MenuItem
                    as={RouterLink}
                    to="/admin"
                    _hover={{ bg: 'brand.50' }}
                  >
                    Admin Dashboard
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    _hover={{ bg: 'red.50', color: 'red.500' }}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                as={RouterLink}
                to="/login"
                variant="solid"
                size="sm"
                leftIcon={<FaUser size="12" />}
              >
                Login
              </Button>
            )}
          </HStack>

          {/* Mobile menu button */}
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
            color="white"
            _hover={{ bg: 'navy.700' }}
          />
        </Flex>

        {/* Mobile Navigation */}
        <Collapse in={isOpen} animateOpacity>
          <Box pb={4} display={{ md: 'none' }}>
            <Stack
              as="nav"
              spacing={3}
              bg="navy.700"
              p={4}
              rounded="lg"
              mt={3}
            >
              <NavLink to="/track" icon={<FaTruck size="14" />}>
                Track Package
              </NavLink>
              <NavLink to="/about" icon={<FaShieldAlt size="14" />}>
                About Us
              </NavLink>
              <NavLink to="/contact" icon={<FaPhone size="14" />}>
                Contact
              </NavLink>
              
              {isAuthenticated ? (
                <>
                  <NavLink to="/admin" icon={<FaUser size="14" />}>
                    Admin Dashboard
                  </NavLink>
                  <Button
                    variant="ghost"
                    color="white"
                    onClick={handleLogout}
                    justifyContent="flex-start"
                    _hover={{ bg: 'red.600' }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="solid"
                  size="sm"
                  leftIcon={<FaUser size="12" />}
                >
                  Login
                </Button>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Container>
    </MotionBox>
  );
};

export default Navbar;