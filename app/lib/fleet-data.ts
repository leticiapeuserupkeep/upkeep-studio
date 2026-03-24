import type { Vehicle } from './models'

export const vehicles: Vehicle[] = [
  {
    id: 'veh-001',
    vin: '1FMEE5BH4NLA36201',
    make: 'Ford',
    model: 'Bronco',
    year: 2022,
    type: 'Commercial',
    title: 'Badlands Advanced 4-Door 4WD',
    bodyStyle: 'SUV / Crossover',
    fuelType: 'Gasoline',
    color: 'Black Onyx',
    licensePlate: 'BCW5058',
    registrationExpiry: 'November 10, 2026',
    location: 'Los Angeles, CA',
    lastUpdated: '2026-03-20T11:43:00Z',
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=200&h=140&fit=crop',
    status: 'operational',
    drivetrain: 'AWD',
    doors: 4,
    odometer: 42,

    engine: {
      type: 'Gasoline',
      displacement: undefined,
      cylinders: undefined,
      horsepower: undefined,
      torque: undefined,
    },

    transmission: {
      type: 'Automatic',
      drivetrain: 'All-Wheel Drive (AWD)',
    },

    fuel: {
      cityMpg: undefined,
      highwayMpg: undefined,
      combinedMpg: undefined,
    },

    dimensions: {
      lengthFt: undefined,
      widthFt: undefined,
      heightFt: undefined,
      wheelbaseIn: undefined,
      weightLbs: undefined,
      passengerVolume: undefined,
      cargoVolume: undefined,
    },

    classification: {
      dealership: 'SB Industries LLC',
      assignedTo: { name: 'Sean Beck', href: '#sean-beck' },
    },

    reliability: {
      status: 'operational',
      uptimePercent: 100,
      downtimePercent: 0,
      availabilityPeriod: 'Last 7 Days',
      depreciation: undefined,
      depreciationNote: "Depreciation can't be calculated because data is missing.",
    },
  },
  {
    id: 'veh-002',
    vin: '2GCEK19T441234567',
    make: 'Chevrolet',
    model: 'Silverado 2500HD',
    year: 2023,
    type: 'Heavy Duty',
    title: 'LT Crew Cab 4WD',
    bodyStyle: 'Pickup Truck',
    fuelType: 'Diesel',
    color: 'Summit White',
    licensePlate: 'TRK-4421',
    registrationExpiry: 'March 15, 2027',
    location: 'Houston, TX',
    lastUpdated: '2026-03-19T09:12:00Z',
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=200&h=140&fit=crop',
    status: 'operational',
    drivetrain: '4WD',
    doors: 4,
    odometer: 18432,

    engine: {
      type: 'Diesel',
      displacement: '6.6L V8',
      cylinders: 8,
      horsepower: 401,
      torque: '464 lb-ft',
    },

    transmission: {
      type: 'Automatic 10-Speed',
      drivetrain: 'Four-Wheel Drive (4WD)',
    },

    fuel: {
      cityMpg: 15,
      highwayMpg: 20,
      combinedMpg: 17,
    },

    dimensions: {
      lengthFt: 20.1,
      widthFt: 6.8,
      heightFt: 6.5,
      wheelbaseIn: 147.4,
      weightLbs: 7442,
      passengerVolume: '128 cu ft',
      cargoVolume: '60 cu ft',
    },

    classification: {
      dealership: 'Metro Fleet Solutions',
      assignedTo: { name: 'James Rodriguez', href: '#james-rodriguez' },
    },

    reliability: {
      status: 'operational',
      uptimePercent: 96,
      downtimePercent: 4,
      availabilityPeriod: 'Last 7 Days',
    },
  },
  {
    id: 'veh-003',
    vin: '5YJ3E1EA8PF123456',
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    type: 'Passenger',
    title: 'Long Range AWD',
    bodyStyle: 'Sedan',
    fuelType: 'Electric',
    color: 'Midnight Silver',
    licensePlate: 'EV-7790',
    registrationExpiry: 'June 20, 2027',
    location: 'San Francisco, CA',
    lastUpdated: '2026-03-21T14:30:00Z',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200&h=140&fit=crop',
    status: 'operational',
    drivetrain: 'AWD',
    doors: 4,
    odometer: 6210,

    engine: {
      type: 'Electric',
      displacement: undefined,
      cylinders: undefined,
      horsepower: 346,
      torque: '389 lb-ft',
    },

    transmission: {
      type: 'Single-Speed',
      drivetrain: 'All-Wheel Drive (AWD)',
    },

    fuel: {
      cityMpg: undefined,
      highwayMpg: undefined,
      combinedMpg: undefined,
    },

    dimensions: {
      lengthFt: 15.4,
      widthFt: 5.9,
      heightFt: 4.7,
      wheelbaseIn: 113.2,
      weightLbs: 4048,
      passengerVolume: '97 cu ft',
      cargoVolume: '23 cu ft',
    },

    classification: {
      dealership: 'Pacific EV Fleet',
      assignedTo: { name: 'Maria Chen', href: '#maria-chen' },
    },

    reliability: {
      status: 'operational',
      uptimePercent: 99,
      downtimePercent: 1,
      availabilityPeriod: 'Last 7 Days',
    },
  },
  {
    id: 'veh-004',
    vin: '1C6SRFJT5PN987654',
    make: 'RAM',
    model: '1500',
    year: 2023,
    type: 'Light Duty',
    title: 'Big Horn Quad Cab 4WD',
    bodyStyle: 'Pickup Truck',
    fuelType: 'Gasoline',
    color: 'Flame Red',
    licensePlate: 'RAM-1122',
    registrationExpiry: 'August 5, 2026',
    location: 'Phoenix, AZ',
    lastUpdated: '2026-03-18T16:55:00Z',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=140&fit=crop',
    status: 'in_shop',
    drivetrain: '4WD',
    doors: 4,
    odometer: 31205,

    engine: {
      type: 'Gasoline',
      displacement: '5.7L V8 HEMI',
      cylinders: 8,
      horsepower: 395,
      torque: '410 lb-ft',
    },

    transmission: {
      type: 'Automatic 8-Speed',
      drivetrain: 'Four-Wheel Drive (4WD)',
    },

    fuel: {
      cityMpg: 15,
      highwayMpg: 22,
      combinedMpg: 18,
    },

    dimensions: {
      lengthFt: 19.5,
      widthFt: 6.7,
      heightFt: 6.3,
      wheelbaseIn: 140.5,
      weightLbs: 5150,
      passengerVolume: '125 cu ft',
      cargoVolume: '54 cu ft',
    },

    classification: {
      dealership: 'Southwest Fleet Group',
      assignedTo: { name: 'Tom Alvarez', href: '#tom-alvarez' },
    },

    reliability: {
      status: 'maintenance',
      uptimePercent: 78,
      downtimePercent: 22,
      availabilityPeriod: 'Last 7 Days',
    },
  },
  {
    id: 'veh-005',
    vin: 'JTDKN3DU0A0654321',
    make: 'Toyota',
    model: 'Prius',
    year: 2025,
    type: 'Passenger',
    title: 'LE AWD-e',
    bodyStyle: 'Hatchback',
    fuelType: 'Hybrid',
    color: 'Celestial Silver',
    licensePlate: 'HYB-3301',
    registrationExpiry: 'December 1, 2027',
    location: 'Portland, OR',
    lastUpdated: '2026-03-21T08:20:00Z',
    image: 'https://images.unsplash.com/photo-1621007690695-71e1fd29e634?w=200&h=140&fit=crop',
    status: 'operational',
    drivetrain: 'AWD',
    doors: 4,
    odometer: 1580,

    engine: {
      type: 'Hybrid',
      displacement: '2.0L I4',
      cylinders: 4,
      horsepower: 196,
      torque: '139 lb-ft',
    },

    transmission: {
      type: 'CVT',
      drivetrain: 'All-Wheel Drive (AWD-e)',
    },

    fuel: {
      cityMpg: 52,
      highwayMpg: 48,
      combinedMpg: 50,
    },

    dimensions: {
      lengthFt: 15.1,
      widthFt: 5.8,
      heightFt: 4.8,
      wheelbaseIn: 108.3,
      weightLbs: 3340,
      passengerVolume: '93 cu ft',
      cargoVolume: '20 cu ft',
    },

    classification: {
      dealership: 'Northwest Auto Fleet',
      assignedTo: { name: 'Lisa Park', href: '#lisa-park' },
    },

    reliability: {
      status: 'operational',
      uptimePercent: 100,
      downtimePercent: 0,
      availabilityPeriod: 'Last 7 Days',
    },
  },
  {
    id: 'veh-006',
    vin: '1FTFW1E54PFA11111',
    make: 'Ford',
    model: 'F-150',
    year: 2023,
    type: 'Commercial',
    title: 'XLT SuperCrew 4WD',
    bodyStyle: 'Pickup Truck',
    fuelType: 'Gasoline',
    color: 'Oxford White',
    licensePlate: 'FLT-8800',
    registrationExpiry: 'September 22, 2026',
    location: 'Denver, CO',
    lastUpdated: '2026-03-20T07:10:00Z',
    image: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=200&h=140&fit=crop',
    status: 'out_of_service',
    drivetrain: '4WD',
    doors: 4,
    odometer: 47890,

    engine: {
      type: 'Gasoline',
      displacement: '3.5L V6 EcoBoost',
      cylinders: 6,
      horsepower: 400,
      torque: '500 lb-ft',
    },

    transmission: {
      type: 'Automatic 10-Speed',
      drivetrain: 'Four-Wheel Drive (4WD)',
    },

    fuel: {
      cityMpg: 18,
      highwayMpg: 24,
      combinedMpg: 20,
    },

    dimensions: {
      lengthFt: 19.3,
      widthFt: 6.7,
      heightFt: 6.4,
      wheelbaseIn: 145.4,
      weightLbs: 4705,
      passengerVolume: '126 cu ft',
      cargoVolume: '52 cu ft',
    },

    classification: {
      dealership: 'Mile High Fleet',
      assignedTo: { name: "Kevin O'Brien", href: '#kevin-obrien' },
    },

    reliability: {
      status: 'critical',
      uptimePercent: 40,
      downtimePercent: 60,
      availabilityPeriod: 'Last 7 Days',
      depreciationNote: 'Major engine fault — pending replacement.',
    },
  },
]
