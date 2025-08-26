import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stack,
  HStack,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaTruck,
  FaShieldAlt,
  FaClock,
  FaGlobe,
  FaChartLine,
  FaHeadset,
  FaCheckCircle,
} from 'react-icons/fa';
import TrackShipment from './TrackShipment';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

const Feature = ({ icon, title, text }) => {
  return (
    <MotionBox
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Stack
        align="center"
        p={6}
        bg="white"
        rounded="xl"
        shadow="md"
        spacing={4}
        h="full"
        border="1px solid"
        borderColor="gray.200"
        _hover={{
          shadow: 'lg',
          borderColor: 'brand.200',
        }}
        transition="all 0.3s"
      >
        <Icon as={icon} w={12} h={12} color="brand.500" />
        <Heading size="md" color="navy.800" textAlign="center">
          {title}
        </Heading>
        <Text color="gray.600" textAlign="center" fontSize="sm">
          {text}
        </Text>
      </Stack>
    </MotionBox>
  );
};

const StatCard = ({ number, label }) => (
  <MotionBox
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
  >
    <VStack
      p={6}
      bg="white"
      rounded="lg"
      shadow="sm"
      border="1px solid"
      borderColor="gray.200"
      spacing={2}
    >
      <Text fontSize="3xl" fontWeight="bold" color="brand.500">
        {number}
      </Text>
      <Text fontSize="sm" color="gray.600" textAlign="center">
        {label}
      </Text>
    </VStack>
  </MotionBox>
);

const Home = () => {
  const features = [
    {
      icon: FaTruck,
      title: 'Fast Delivery',
      text: 'Express delivery within 24-48 hours across major cities with real-time tracking.',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure Handling',
      text: 'Your packages are handled with utmost care and security throughout the journey.',
    },
    {
      icon: FaClock,
      title: '24/7 Tracking',
      text: 'Monitor your shipment status anytime, anywhere with our advanced tracking system.',
    },
    {
      icon: FaGlobe,
      title: 'Pan India Coverage',
      text: 'Extensive network covering all major cities and remote locations across India.',
    },
    {
      icon: FaChartLine,
      title: 'Business Solutions',
      text: 'Tailored logistics solutions for businesses of all sizes with competitive rates.',
    },
    {
      icon: FaHeadset,
      title: 'Customer Support',
      text: 'Dedicated customer support team available to assist you round the clock.',
    },
  ];

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Hero Section */}
      <MotionContainer
        maxW="7xl"
        py={20}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Stack
          align="center"
          spacing={8}
          py={20}
          direction={{ base: 'column', lg: 'row' }}
        >
          <VStack
            align={{ base: 'center', lg: 'start' }}
            spacing={6}
            flex={1}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            <Badge
              colorScheme="blue"
              variant="subtle"
              px={3}
              py={1}
              rounded="full"
              fontSize="sm"
            >
              India's Trusted Courier Partner
            </Badge>
            
            <Heading
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              fontWeight="bold"
              color="navy.800"
              lineHeight="1.1"
            >
              Fast, Reliable{' '}
              <Text as="span" color="brand.500">
                Courier Services
              </Text>
            </Heading>
            
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              maxW="lg"
            >
              Your trusted partner for secure and timely delivery across India. 
              Experience professional logistics solutions with real-time tracking 
              and 24/7 customer support.
            </Text>
            
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                variant="solid"
                rightIcon={<FaTruck />}
                _hover={{ transform: 'translateY(-2px)' }}
              >
                Ship Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                rightIcon={<FaCheckCircle />}
              >
                Learn More
              </Button>
            </HStack>

            {/* Trust Indicators */}
            <HStack spacing={8} pt={6}>
              <StatCard number="50K+" label="Happy Customers" />
              <StatCard number="200+" label="Cities Covered" />
              <StatCard number="99.9%" label="On-Time Delivery" />
            </HStack>
          </VStack>

          {/* Tracking Section */}
          <Box
            flex={1}
            w="full"
            maxW="500px"
          >
            <MotionBox
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Box
                bg="white"
                p={8}
                rounded="2xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.200"
              >
                <VStack spacing={6} align="stretch">
                  <VStack spacing={2}>
                    <Icon as={FaTruck} w={8} h={8} color="brand.500" />
                    <Heading size="lg" color="navy.800" textAlign="center">
                      Track Your Shipment
                    </Heading>
                    <Text color="gray.600" textAlign="center" fontSize="sm">
                      Enter your tracking number to get real-time updates
                    </Text>
                  </VStack>
                  
                  <Divider />
                  
                  <TrackShipment />
                </VStack>
              </Box>
            </MotionBox>
          </Box>
        </Stack>
      </MotionContainer>

      {/* Features Section */}
      <Box bg="white" py={20}>
        <Container maxW="7xl">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <VStack spacing={12}>
              <VStack spacing={4}>
                <Heading
                  fontSize={{ base: '3xl', md: '4xl' }}
                  color="navy.800"
                  textAlign="center"
                >
                  Why Choose Shanu Services?
                </Heading>
                <Text
                  fontSize="lg"
                  color="gray.600"
                  textAlign="center"
                  maxW="2xl"
                >
                  We provide comprehensive logistics solutions with cutting-edge 
                  technology and personalized service to meet all your shipping needs.
                </Text>
              </VStack>

              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={8}
                w="full"
              >
                {features.map((feature, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Feature {...feature} />
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;