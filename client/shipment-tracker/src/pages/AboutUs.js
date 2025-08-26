import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaTruck,
  FaGlobe,
  FaAward,
  FaUsers,
  FaShieldAlt,
  FaClock,
  FaHandshake,
  FaChartLine,
  FaHeart,
  FaLeaf,
} from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const ValueCard = ({ icon, title, description }) => (
  <MotionCard
    variant="elevated"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <CardBody textAlign="center" p={8}>
      <VStack spacing={4}>
        <Box p={4} bg="brand.100" rounded="full">
          <Icon as={icon} w={8} h={8} color="brand.500" />
        </Box>
        <Heading size="md" color="navy.800">
          {title}
        </Heading>
        <Text color="gray.600" fontSize="sm">
          {description}
        </Text>
      </VStack>
    </CardBody>
  </MotionCard>
);

const StatCard = ({ icon, number, label, description }) => (
  <MotionCard
    variant="outline"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <CardBody>
      <Stat>
        <Flex align="center" mb={2}>
          <Icon as={icon} color="brand.500" mr={2} />
          <StatLabel fontSize="sm" color="gray.600" fontWeight="600">
            {label}
          </StatLabel>
        </Flex>
        <StatNumber fontSize="2xl" color="navy.800" fontWeight="bold">
          {number}
        </StatNumber>
        <StatHelpText fontSize="xs" color="gray.500">
          {description}
        </StatHelpText>
      </Stat>
    </CardBody>
  </MotionCard>
);

const TimelineItem = ({ year, title, description, isLast = false }) => (
  <HStack align="start" spacing={4}>
    <VStack spacing={0}>
      <Box
        w={4}
        h={4}
        rounded="full"
        bg="brand.500"
        border="2px solid white"
        shadow="md"
      />
      {!isLast && <Box w="2px" h={16} bg="gray.300" />}
    </VStack>
    <VStack align="start" spacing={2} pb={8}>
      <Badge colorScheme="blue" variant="solid" px={3} py={1} rounded="full">
        {year}
      </Badge>
      <Heading size="sm" color="navy.800">
        {title}
      </Heading>
      <Text fontSize="sm" color="gray.600">
        {description}
      </Text>
    </VStack>
  </HStack>
);

const AboutUs = () => {
  const stats = [
    {
      icon: FaUsers,
      number: '50,000+',
      label: 'Happy Customers',
      description: 'Satisfied clients across India'
    },
    {
      icon: FaTruck,
      number: '500+',
      label: 'Daily Deliveries',
      description: 'Packages delivered every day'
    },
    {
      icon: FaGlobe,
      number: '200+',
      label: 'Cities Covered',
      description: 'Pan-India delivery network'
    },
    {
      icon: FaAward,
      number: '99.9%',
      label: 'Success Rate',
      description: 'On-time delivery guarantee'
    },
  ];

  const values = [
    {
      icon: FaShieldAlt,
      title: 'Reliability',
      description: 'We ensure your packages reach their destination safely and on time, every single time.'
    },
    {
      icon: FaClock,
      title: 'Speed',
      description: 'Fast processing and express delivery options to meet your urgent shipping needs.'
    },
    {
      icon: FaHandshake,
      title: 'Trust',
      description: 'Building lasting relationships through transparent processes and honest communication.'
    },
    {
      icon: FaHeart,
      title: 'Customer Care',
      description: 'Dedicated support team available 24/7 to assist with all your shipping requirements.'
    },
    {
      icon: FaLeaf,
      title: 'Sustainability',
      description: 'Committed to eco-friendly practices and reducing our environmental footprint.'
    },
    {
      icon: FaChartLine,
      title: 'Innovation',
      description: 'Constantly improving our technology and processes to provide better service.'
    },
  ];

  const timeline = [
    {
      year: '2018',
      title: 'Company Founded',
      description: 'Started as a small courier service in Indore with a vision to connect India.'
    },
    {
      year: '2019',
      title: 'Regional Expansion',
      description: 'Expanded operations to cover major cities in Madhya Pradesh and neighboring states.'
    },
    {
      year: '2021',
      title: 'Technology Integration',
      description: 'Launched our real-time tracking system and mobile-friendly platform.'
    },
    {
      year: '2023',
      title: 'Pan-India Network',
      description: 'Achieved nationwide coverage with 200+ cities and towns in our delivery network.'
    },
    {
      year: '2025',
      title: 'Digital Excellence',
      description: 'Leading the industry with AI-powered logistics and sustainable delivery solutions.',
      isLast: true
    },
  ];

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Hero Section */}
      <Box bg="navy.800" color="white" py={20}>
        <Container maxW="7xl">
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <VStack spacing={6} textAlign="center" maxW="4xl" mx="auto">
              <Badge colorScheme="blue" variant="solid" px={4} py={2} rounded="full">
                Since 2018
              </Badge>
              <Heading fontSize={{ base: '4xl', md: '5xl' }} fontWeight="bold">
                About Shanu Services
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} opacity={0.9} maxW="3xl">
                We are India's trusted courier partner, dedicated to connecting people and businesses 
                across the nation with reliable, fast, and secure delivery solutions.
              </Text>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxW="7xl" py={16}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {stats.map((stat, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <StatCard {...stat} />
              </MotionBox>
            ))}
          </SimpleGrid>
        </MotionBox>
      </Container>

      {/* Mission Section */}
      <Box bg="white" py={16}>
        <Container maxW="7xl">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <VStack spacing={12}>
              <VStack spacing={4} textAlign="center">
                <Heading fontSize="3xl" color="navy.800">
                  Our Mission & Vision
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="3xl">
                  To revolutionize logistics in India by providing reliable, technology-driven 
                  courier services that connect every corner of the nation.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
                <Card variant="elevated" bg="brand.50" borderColor="brand.200">
                  <CardBody p={8}>
                    <VStack align="start" spacing={4}>
                      <HStack>
                        <Icon as={FaHeart} color="brand.500" w={6} h={6} />
                        <Heading size="lg" color="navy.800">
                          Our Mission
                        </Heading>
                      </HStack>
                      <Text color="gray.700">
                        To provide exceptional courier and logistics services that exceed customer 
                        expectations through innovation, reliability, and personalized care. We strive 
                        to make shipping seamless, affordable, and accessible for everyone.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card variant="elevated" bg="navy.50" borderColor="navy.200">
                  <CardBody p={8}>
                    <VStack align="start" spacing={4}>
                      <HStack>
                        <Icon as={FaGlobe} color="navy.500" w={6} h={6} />
                        <Heading size="lg" color="navy.800">
                          Our Vision
                        </Heading>
                      </HStack>
                      <Text color="gray.700">
                        To become India's most trusted and innovative logistics partner, connecting 
                        businesses and individuals across the country while setting new standards 
                        for speed, security, and customer satisfaction.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Values Section */}
      <Container maxW="7xl" py={16}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading fontSize="3xl" color="navy.800">
                Our Core Values
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="3xl">
                The principles that guide everything we do and shape our commitment to excellence.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {values.map((value, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ValueCard {...value} />
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </MotionBox>
      </Container>

      {/* Timeline Section */}
      <Box bg="white" py={16}>
        <Container maxW="5xl">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <VStack spacing={12}>
              <VStack spacing={4} textAlign="center">
                <Heading fontSize="3xl" color="navy.800">
                  Our Journey
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="3xl">
                  From humble beginnings to becoming a trusted logistics partner across India.
                </Text>
              </VStack>

              <Box w="full" maxW="2xl">
                {timeline.map((item, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <TimelineItem {...item} />
                  </MotionBox>
                ))}
              </Box>
            </VStack>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUs;