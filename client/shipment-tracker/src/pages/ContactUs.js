import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  SimpleGrid,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Icon,
  Link,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPaperPlane,
} from 'react-icons/fa';
import axios from 'axios';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const ContactCard = ({ icon, title, info, link, linkText }) => (
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
          {info}
        </Text>
        {link && (
          <Link
            href={link}
            color="brand.500"
            fontWeight="600"
            fontSize="sm"
            _hover={{ color: 'brand.600' }}
          >
            {linkText}
          </Link>
        )}
      </VStack>
    </CardBody>
  </MotionCard>
);

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Replace with your actual contact form endpoint
      await axios.post('/api/contact', formData);
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      
      toast({
        title: 'Message Sent Successfully',
        description: 'We will get back to you within 24 hours',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please try again or contact us directly.');
      
      toast({
        title: 'Message Failed',
        description: 'Please try again or contact us directly',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Phone Number',
      info: '+91 98765 43210',
      link: 'tel:+919876543210',
      linkText: 'Call Now'
    },
    {
      icon: FaEnvelope,
      title: 'Email Address',
      info: 'support@shanucourier.com',
      link: 'mailto:support@shanucourier.com',
      linkText: 'Send Email'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Head Office',
      info: '123 Business District, Indore, Madhya Pradesh 452001',
      link: 'https://maps.google.com',
      linkText: 'View on Map'
    },
    {
      icon: FaClock,
      title: 'Business Hours',
      info: 'Monday - Saturday: 9:00 AM - 6:00 PM, Sunday: 10:00 AM - 4:00 PM',
      link: null,
      linkText: null
    }
  ];

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Hero Section */}
      <Box bg="navy.800" color="white" py={16}>
        <Container maxW="7xl">
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <VStack spacing={4} textAlign="center">
              <Heading fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold">
                Get in Touch
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} opacity={0.9} maxW="3xl">
                Have questions about our services? Need support with your shipment? 
                We're here to help you 24/7.
              </Text>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      <Container maxW="7xl" py={16}>
        {/* Contact Information */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          mb={16}
        >
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Heading fontSize="2xl" color="navy.800">
                Contact Information
              </Heading>
              <Text color="gray.600" maxW="2xl">
                Reach out to us through any of the following channels. Our team is ready 
                to assist you with all your courier and logistics needs.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
              {contactInfo.map((contact, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ContactCard {...contact} />
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </MotionBox>

        {/* Contact Form and Map */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
          {/* Contact Form */}
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card variant="elevated">
              <CardBody p={8}>
                <VStack spacing={6} align="stretch">
                  <VStack spacing={2} align="start">
                    <Heading size="lg" color="navy.800">
                      Send us a Message
                    </Heading>
                    <Text color="gray.600">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </Text>
                  </VStack>

                  {success && (
                    <Alert status="success" rounded="lg">
                      <AlertIcon />
                      Your message has been sent successfully! We'll get back to you soon.
                    </Alert>
                  )}

                  {error && (
                    <Alert status="error" rounded="lg">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl isRequired>
                          <FormLabel color="gray.700" fontWeight="600">
                            Full Name
                          </FormLabel>
                          <Input
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange}
                            bg="white"
                            disabled={loading}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel color="gray.700" fontWeight="600">
                            Email Address
                          </FormLabel>
                          <Input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            bg="white"
                            disabled={loading}
                          />
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl>
                          <FormLabel color="gray.700" fontWeight="600">
                            Phone Number
                          </FormLabel>
                          <Input
                            name="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            bg="white"
                            disabled={loading}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color="gray.700" fontWeight="600">
                            Subject
                          </FormLabel>
                          <Input
                            name="subject"
                            placeholder="What's this about?"
                            value={formData.subject}
                            onChange={handleInputChange}
                            bg="white"
                            disabled={loading}
                          />
                        </FormControl>
                      </SimpleGrid>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="600">
                          Message
                        </FormLabel>
                        <Textarea
                          name="message"
                          placeholder="Tell us how we can help you..."
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange}
                          bg="white"
                          disabled={loading}
                          resize="vertical"
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        size="lg"
                        w="full"
                        leftIcon={loading ? <Spinner size="sm" /> : <FaPaperPlane />}
                        isLoading={loading}
                        loadingText="Sending..."
                      >
                        Send Message
                      </Button>
                    </VStack>
                  </form>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>

          {/* Additional Information */}
          <MotionBox
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <VStack spacing={8} h="full">
              {/* Map Placeholder */}
              <Card variant="elevated" w="full">
                <CardBody p={0}>
                  <Box
                    h="300px"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    rounded="lg"
                    position="relative"
                    overflow="hidden"
                  >
                    <VStack spacing={3}>
                      <Icon as={FaMapMarkerAlt} w={12} h={12} color="gray.400" />
                      <Text color="gray.500" fontWeight="600">
                        Indore, Madhya Pradesh
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        Interactive map coming soon
                      </Text>
                    </VStack>
                  </Box>
                </CardBody>
              </Card>

              {/* Quick Support */}
              <Card variant="elevated" bg="brand.50" borderColor="brand.200" w="full">
                <CardBody p={6}>
                  <VStack spacing={4}>
                    <Heading size="md" color="navy.800">
                      Need Immediate Help?
                    </Heading>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      For urgent queries or tracking issues, call our 24/7 helpline
                    </Text>
                    <Button
                      size="lg"
                      variant="solid"
                      leftIcon={<FaPhone />}
                      as="a"
                      href="tel:+919876543210"
                    >
                      Call Support
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Social Media */}
              <Card variant="outline" w="full">
                <CardBody p={6}>
                  <VStack spacing={4}>
                    <Heading size="md" color="navy.800">
                      Follow Us
                    </Heading>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Stay connected for updates and offers
                    </Text>
                    <HStack spacing={4}>
                      <Link href="#" _hover={{ color: 'brand.500' }}>
                        <Icon as={FaFacebook} w={6} h={6} color="gray.500" />
                      </Link>
                      <Link href="#" _hover={{ color: 'brand.500' }}>
                        <Icon as={FaTwitter} w={6} h={6} color="gray.500" />
                      </Link>
                      <Link href="#" _hover={{ color: 'brand.500' }}>
                        <Icon as={FaInstagram} w={6} h={6} color="gray.500" />
                      </Link>
                      <Link href="#" _hover={{ color: 'brand.500' }}>
                        <Icon as={FaLinkedin} w={6} h={6} color="gray.500" />
                      </Link>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default ContactUs;