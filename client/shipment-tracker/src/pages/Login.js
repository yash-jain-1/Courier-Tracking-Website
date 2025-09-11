import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Link,
  Divider,
  useToast,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ViewIcon, ViewOffIcon, LockIcon} from '@chakra-ui/icons';
import { FaShieldAlt, FaUserShield } from 'react-icons/fa';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { adminLogin } from '../services/api';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await adminLogin({
        username: formData.username,
        password: formData.password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back! Redirecting to dashboard...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Invalid credentials. Please try again.'
      );
      
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials and try again',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('navy.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const inputBg = useColorModeValue('white', 'gray.700');
  return (
    <Box bg={bg} minH="100vh" py={12}>
      <Container maxW="md">
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <VStack spacing={4} textAlign="center">
              <MotionBox
                p={4}
                bg="brand.500"
                rounded="full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <FaUserShield size="32" color="white" />
              </MotionBox>
              
              <VStack spacing={2}>
                <Heading color={headingColor} fontSize="2xl">
                  Admin Login
                </Heading>
                <Text color={textColor}>
                  Sign in to access your dashboard
                </Text>
              </VStack>
            </VStack>

            {/* Login Form */}
            <MotionCard
              variant="elevated"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardBody p={8} bg={cardBg} borderRadius="lg" borderColor={cardBorder}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6}>
                    {error && (
                      <Alert status="error" rounded="lg">
                        <AlertIcon />
                        {error}
                      </Alert>
                    )}

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="600">
                        Username
                      </FormLabel>
                      <InputGroup>
                        <Input
                          name="username"
                          type="text"
                          placeholder="Enter your username"
                          value={formData.username}
                          onChange={handleInputChange}
                          bg={inputBg}
                          border="2px solid"
                          borderColor={cardBorder}
                          _hover={{ borderColor: 'brand.300' }}
                          _focus={{
                            borderColor: 'brand.500',
                            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                          }}
                          disabled={loading}
                        />
                        <InputRightElement>
                          <FaUserShield color="gray.400" />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="600">
                        Password
                      </FormLabel>
                      <InputGroup>
                        <Input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          bg={inputBg}
                          border="2px solid"
                          borderColor={cardBorder}
                          _hover={{ borderColor: 'brand.300' }}
                          _focus={{
                            borderColor: 'brand.500',
                            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                          }}
                          disabled={loading}
                        />
                        <InputRightElement>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <Button
                      type="submit"
                      size="lg"
                      w="full"
                      leftIcon={loading ? <Spinner size="sm" /> : <LockIcon />}
                      isLoading={loading}
                      loadingText="Signing In..."
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </MotionCard>

            {/* Security Notice */}
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card variant="outline" bg={useColorModeValue('blue.50', 'blue.900')} borderColor={useColorModeValue('blue.200', 'blue.700')}>
                <CardBody>
                  <HStack spacing={3}>
                    <FaShieldAlt color="var(--chakra-colors-blue-500)" />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="600" color={useColorModeValue('blue.800', 'blue.100')}>
                        Secure Login
                      </Text>
                      <Text fontSize="xs" color={useColorModeValue('blue.600', 'blue.200')}>
                        Your login is protected with industry-standard encryption
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </MotionBox>

            {/* Back to Home */}
            <VStack spacing={2}>
              <Divider />
              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.300')} textAlign="center">
                Not an admin?{' '}
                <Link as={RouterLink} to="/" color={useColorModeValue('brand.500', 'brand.200')} fontWeight="600">
                  Go back to home
                </Link>
              </Text>
            </VStack>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Login;