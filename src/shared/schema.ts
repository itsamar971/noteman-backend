import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for admins
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Resource schema for PDFs and textbooks
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fileName: text("fileName").notNull(),
  fileUrl: text("fileUrl").notNull(), // Direct URL to the file in Supabase Storage
  storagePath: text("storagePath").notNull(), // Path in the bucket for deletion/updates
  fileSize: integer("fileSize").notNull(),
  fileType: text("fileType").notNull(), // MIME type
  semester: text("semester").notNull(),  // e.g., "I Year I Semester"
  branch: text("branch").notNull(), // e.g., "Civil Engineering"
  subject: text("subject").notNull(), // e.g., "Matrices and Calculus"
  category: text("category").notNull(), // "exam" or "textbook"
  author: text("author"),  // Only for textbooks, nullable
  pages: integer("pages"),  // Nullable
  uploadedAt: timestamp("uploadedAt").defaultNow(),
  uploadedBy: text("uploadedBy"),  // Nullable
  viewCount: integer("viewCount").default(0), // Tracking clicks/views
});

export const resourceSchema = createInsertSchema(resources).omit({
  id: true,
  uploadedAt: true,
});

export const insertResourceSchema = resourceSchema.extend({
  fileUrl: z.string().url("Valid file URL is required"),
  storagePath: z.string().min(1, "Storage path is required"),
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Semester structure
export const semesters = [
  "I Year I Semester",
  "I Year II Semester",
  "II Year I Semester",
  "II Year II Semester",
  "III Year I Semester",
  "III Year II Semester",
  "IV Year I Semester",
  "IV Year II Semester"
];

// Branches
export const branches = [
  "Civil Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Electronics & Communication Engineering",
  "Chemical Engineering",
  "Geoinformatics",
  "Metallurgical Engineering",
  "CSE (Artificial Intelligence & Machine Learning)",
  "CSE (Cyber Security)",
  "CSE (Regular / General)",
  "Biotechnology"
];

// 1. Civil Engineering Subjects
export const civilSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Applied Physics", "C Programming and Data Structures", "Engineering Workshop", "English for Skill Enhancement", "Elements of Civil Engineering", "Applied Physics Laboratory", "C Programming Laboratory", "English Communication Lab", "Environmental Science"],
  "I Year II Semester": ["Ordinary Differential Equations and Vector Calculus", "Engineering Chemistry", "Computer Aided Engineering Graphics", "Applied Mechanics", "Surveying", "Python Programming Lab", "Engineering Chemistry Lab", "Surveying Lab"],
  "II Year I Semester": ["Probability and Statistics", "Building Materials, Construction and Planning", "Engineering Geology", "Strength of Materials – I", "Fluid Mechanics", "Surveying Lab II", "Strength of Materials Lab", "CAD Lab", "Constitution of India"],
  "II Year II Semester": ["Basic Electrical and Electronics Engineering", "Concrete Technology", "Strength of Materials – II", "Hydraulics and Hydraulic Machinery", "Structural Analysis – I", "Fluid Mechanics Lab", "Electrical Lab", "Concrete Lab", "Project"],
  "III Year I Semester": ["Structural Analysis – II", "Geotechnical Engineering", "RCC (Structural Engineering I)", "Business Economics", "Transportation Engineering", "Hydrology and Water Resources", "Transportation Lab", "Geotechnical Lab", "IPR"],
  "III Year II Semester": ["Environmental Engineering", "Foundation Engineering", "Steel Structures", "Professional Elective I", "Open Elective I", "Environmental Lab", "CAD Lab", "English Lab", "Internship"],
  "IV Year I Semester": ["Quantity Survey & Valuation", "Project Management", "Professional Elective II", "Professional Elective III", "Professional Elective IV", "Open Elective II", "Software Lab", "Project Stage I"],
  "IV Year II Semester": ["Professional Elective V", "Professional Elective VI", "Open Elective III", "Project Stage II"]
};

// 2. Electrical & Electronics Engineering (EEE)
export const eeeSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Engineering Chemistry", "C Programming and Data Structures", "Electrical Circuit Analysis I", "Engineering Graphics", "Elements of Electrical Engineering", "Chemistry Lab", "C Programming Lab"],
  "I Year II Semester": ["ODE and Vector Calculus", "Applied Physics", "Engineering Workshop", "English", "Electrical Circuit Analysis II", "Python Lab", "Physics Lab", "English Lab", "Circuit Lab", "Environmental Science"],
  "II Year I Semester": ["Numerical Methods", "Electrical Machines I", "Power System I", "Analog Circuits", "Electromagnetic Fields", "Machines Lab", "Analog Lab", "Simulation Lab", "Gender Sensitization"],
  "II Year II Semester": ["Solid Mechanics & Hydraulic Machines", "Measurements & Instrumentation", "Electrical Machines II", "Digital Electronics", "Power System II", "Digital Lab", "Instrumentation Lab", "Machines Lab", "Project", "Constitution of India"],
  "III Year I Semester": ["Power Electronics", "Control Systems", "Microprocessors & Microcontrollers", "Professional Elective I", "Business Economics", "Microprocessor Lab", "Power Electronics Lab", "English Lab", "IPR"],
  "III Year II Semester": ["Open Elective I", "Professional Elective II", "Digital Signal Processing", "Power System Protection", "Power System Operation", "Power System Lab", "Control Lab", "DSP Lab", "Internship"],
  "IV Year I Semester": ["Renewable Energy Power Electronics", "Open Elective II", "Professional Elective III", "Professional Elective IV", "Management", "Renewable Lab", "Project Stage I"],
  "IV Year II Semester": ["Open Elective III", "Professional Elective V", "Professional Elective VI", "Project Stage II"]
};

// 3. Mechanical Engineering
export const mechSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Applied Physics", "C Programming", "Engineering Workshop", "English", "Elements of Mechanical Engineering", "Physics Lab", "English Lab", "C Programming Lab", "Environmental Science"],
  "I Year II Semester": ["ODE and Vector Calculus", "Engineering Chemistry", "Engineering Graphics", "Engineering Mechanics", "Engineering Materials", "Python Lab", "Chemistry Lab", "Fuels Lab"],
  "II Year I Semester": ["Probability & Statistics", "Mechanics of Solids", "Metallurgy", "Production Technology", "Thermodynamics", "Production Lab", "Material Lab", "Machine Drawing", "Constitution"],
  "II Year II Semester": ["Basic Electrical Engineering", "Kinematics of Machinery", "Fluid Mechanics", "IC Engines & Gas Turbines", "Instrumentation & Control", "Electrical Lab", "Fluid Lab", "Control Lab", "Project"],
  "III Year I Semester": ["Dynamics of Machinery", "Machine Design", "Metrology", "Business Economics", "Steam Power", "CAD/CAM", "Thermal Lab", "Metrology Lab", "Dynamics Lab", "IPR"],
  "III Year II Semester": ["Machine Design II", "Heat Transfer", "Finite Element Methods", "Professional Elective I", "Open Elective I", "Heat Transfer Lab", "CAE Lab", "English Lab", "Internship"],
  "IV Year I Semester": ["Industrial Management", "Refrigeration & AC", "Professional Elective II", "Professional Elective III", "Professional Elective IV", "Open Elective II", "Project Stage I"],
  "IV Year II Semester": ["Professional Elective V", "Professional Elective VI", "Open Elective III", "Project Stage II"]
};

// 4. Electronics & Communication Engineering (ECE)
export const eceSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Applied Physics", "C Programming", "Engineering Workshop", "English", "Basics of ECE", "Physics Lab", "English Lab", "C Lab", "Environmental Science"],
  "I Year II Semester": ["ODE & Vector Calculus", "Engineering Chemistry", "Engineering Graphics", "Basic Electrical", "Electronic Devices", "Python Lab", "Chemistry Lab", "Electrical Lab", "EDC Lab"],
  "II Year I Semester": ["Analog Circuits", "Network Analysis", "Digital Logic Design", "Signals & Systems", "Probability Theory", "Analog Lab", "Digital Lab", "Simulation Lab", "Constitution"],
  "II Year II Semester": ["Numerical Methods", "EM Fields & Transmission Lines", "Analog & Digital Communication", "Linear IC Applications", "Circuit Analysis", "Communication Lab", "IC Lab", "Circuit Lab", "Project"],
  "III Year I Semester": ["Microcontrollers", "IoT", "Control Systems", "Business Economics", "Professional Elective I", "Microcontroller Lab", "IoT Lab", "English Lab", "IPR"],
  "III Year II Semester": ["Antennas", "Digital Signal Processing", "VLSI Design", "Professional Elective II", "Open Elective I", "DSP Lab", "VLSI Lab", "Communication Lab", "Internship"],
  "IV Year I Semester": ["Microwave & Optical Communication", "Professional Elective III", "Professional Elective IV", "Open Elective II", "Law & Ethics", "Microwave Lab", "Project Stage I"],
  "IV Year II Semester": ["Professional Elective V", "Professional Elective VI", "Open Elective III", "Project Stage II"]
};

// 5. Chemical Engineering
export const chemSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Applied Physics", "C Programming and Data Structures", "Engineering Workshop", "English for Skill Enhancement", "Elements of Chemical Engineering"],
  "I Year II Semester": ["Ordinary Differential Equations and Vector Calculus", "Engineering Chemistry", "Computer Aided Engineering Graphics", "Engineering Mechanics", "Material Science for Chemical Engineering", "Python Programming Laboratory"],
  "II Year I Semester": ["Probability, Statistics and Complex Variables", "Material and Energy Balance Computations", "Chemical Engineering Fluid Mechanics", "Inorganic & Physical Chemistry", "Basic Electrical and Electronics Engineering"],
  "II Year II Semester": ["Chemical Engineering Thermodynamics-I", "Mechanical Operations", "Process Heat Transfer", "Fundamentals of Management for Engineers", "Organic & Analytical Chemistry"],
  "III Year I Semester": ["Mass Transfer Operations-I", "Chemical Reaction Engineering-I", "Instrumentation and Process Control", "Chemical Engineering Thermodynamics-II", "Process Modelling & Simulation", "Chemical Technology"],
  "III Year II Semester": ["Mass Transfer Operations-II", "Chemical Reaction Engineering-II", "Process Equipment Design", "Professional Elective-I", "Open Elective-I"],
  "IV Year I Semester": ["Transport Phenomena", "Chemical Engineering Plant Design and Economics", "Professional Elective-II", "Professional Elective-III", "Professional Elective-IV", "Open Elective-II"],
  "IV Year II Semester": ["Professional Elective-V", "Professional Elective-VI", "Open Elective-III"]
};

// 6. Geoinformatics
export const geoSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Applied Physics", "C Programming and Data Structures", "Engineering Workshop", "English for Skill Enhancement", "Elements of Geoinformatics"],
  "I Year II Semester": ["Ordinary Differential Equations and Vector Calculus", "Engineering Chemistry", "Data Structures and Object Oriented Programming", "Engineering Graphics", "Basics of Electrical and Electronics Engineering"],
  "II Year I Semester": ["Fourier Transform and Statistics", "Basic Electrical and Electronics Engineering", "Surveying", "Remote Sensing", "Photogrammetry and Basics of Unmanned Aerial Vehicles (UAVs)"],
  "II Year II Semester": ["Sensors and Data Products", "Advanced Geodesy", "Digital Image Processing", "Geographical Information Science and Systems", "Geostatistics in Geoinformatics"],
  "III Year I Semester": ["Microwave Remote Sensing", "Global Navigation Satellite System", "Spatial Analysis and Applications", "Mapping Toolboxes for Geomatics", "Geoinformatics for Hydrology and Water Resources Engineering", "Professional Elective-I"],
  "III Year II Semester": ["Geospatial Analysis with R-programming", "Augmented Reality (AR) and Virtual Reality (VR) in Geospatial Applications", "Hyperspectral Remote Sensing", "Professional Elective-II", "Open Elective-I"],
  "IV Year I Semester": ["Satellite Meteorology", "Geospatial Law and NGP", "Professional Elective-III", "Professional Elective-IV", "Professional Practice, Law and Ethics", "Open Elective-II"],
  "IV Year II Semester": ["Professional Elective-V", "Professional Elective-VI", "Open Elective-III"]
};

// 7. Metallurgical Engineering
export const metSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Applied Physics", "C Programming and Data Structures", "Engineering Workshop", "English for Skill Enhancement", "Elements of Metallurgical Engineering"],
  "I Year II Semester": ["Ordinary Differential Equations and Vector Calculus", "Engineering Chemistry", "Computer Aided Engineering Graphics", "Engineering Mechanics", "Metallurgical Thermodynamics"],
  "II Year I Semester": ["Probability, Statistics and Complex Variables", "Extractive Metallurgy", "Physical Metallurgy", "Inorganic & Physical Chemistry", "Basic Electrical and Electronics Engineering"],
  "II Year II Semester": ["Organic & Analytical Chemistry", "Mechanical Operations", "Manufacturing Processes", "Fundamentals of Management for Engineers", "Materials Characterization"],
  "III Year I Semester": ["Mechanical Metallurgy", "Iron Making", "Steel Making and Casting", "Nonferrous Extractive Metallurgy", "Instrumentation and Process Control"],
  "III Year II Semester": ["Corrosion Engineering", "Mechanical Properties and Testing", "Phase Diagrams and Microstructure", "Professional Elective-I", "Open Elective-I"],
  "IV Year I Semester": ["Fabrication and Welding Technology", "Quality Control and Reliability", "Professional Elective-II", "Professional Elective-III", "Professional Elective-IV", "Open Elective-II"],
  "IV Year II Semester": ["Professional Elective-V", "Professional Elective-VI", "Open Elective-III"]
};

// 8. CSE (Artificial Intelligence & Machine Learning)
export const cseAimlSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Applied Physics", "Programming for Problem Solving", "Engineering Workshop", "English for Skill Enhancement", "Elements of Computer Science & Engineering", "Applied Physics Laboratory", "Programming for Problem Solving Laboratory", "English Language and Communication Skills Laboratory"],
  "I Year II Semester": ["Ordinary Differential Equations and Vector Calculus", "Engineering Chemistry", "Computer Aided Engineering Graphics", "Basic Electrical Engineering", "Electronic Devices and Circuits", "Python Programming Laboratory", "Engineering Chemistry Laboratory", "Basic Electrical Engineering Laboratory", "IT Workshop"],
  "II Year I Semester": ["Mathematical and Statistical Foundations", "Data Structures", "Computer Organization and Architecture", "Software Engineering", "Operating Systems", "Introduction to Data Structures Lab", "Operating Systems Lab", "Software Engineering Lab", "Node JS / React JS / Django"],
  "II Year II Semester": ["Discrete Mathematics", "Automata Theory and Compiler Design", "Database Management Systems", "Introduction to Artificial Intelligence", "Object Oriented Programming through Java", "Database Management Systems Lab", "Java Programming Lab", "Real-time Research Project / Field-Based Research Project", "Prolog / Lisp / Pyswip"],
  "III Year I Semester": ["Design and Analysis of Algorithms", "Machine Learning", "Computer Networks", "Business Economics & Financial Analysis", "Professional Elective-I", "Machine Learning Lab", "Computer Networks Lab", "Advanced English Communication Skills Lab", "UI design - Flutter"],
  "III Year II Semester": ["Knowledge Representation and Reasoning", "Data Analytics", "Natural Language Processing", "Professional Elective-II", "Open Elective-I", "Natural Language Processing Lab", "Data Analytics Lab", "Industrial Oriented Mini Project / Internship"],
  "IV Year I Semester": ["Deep Learning", "Nature Inspired Computing", "Professional Elective-III", "Professional Elective-IV", "Open Elective-II", "Professional Practice, Law & Ethics", "Project Stage-I"],
  "IV Year II Semester": ["Professional Elective-V", "Professional Elective-VI", "Open Elective-III", "Project Stage-II"]
};

// 9. CSE (Cyber Security)
export const cseCyberSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Engineering Chemistry", "Programming for Problem Solving", "Basic Electrical Engineering", "Computer Aided Engineering Graphics", "Elements of Computer Science & Engineering", "Engineering Chemistry Laboratory", "Programming for Problem Solving Laboratory", "Basic Electrical Engineering Laboratory"],
  "I Year II Semester": ["Ordinary Differential Equations and Vector Calculus", "Applied Physics", "Engineering Workshop", "English for Skill Enhancement", "Electronic Devices and Circuits", "Python Programming Laboratory", "Applied Physics Laboratory", "English Language and Communication Skills Laboratory", "IT Workshop"],
  "II Year I Semester": ["Digital Electronics", "Data Structures", "Computer Oriented Statistical Methods", "Computer Organization and Architecture", "Object Oriented Programming through Java", "Data Structures Lab", "Object Oriented Programming through Java Lab", "Data visualization - R Programming / Power BI"],
  "II Year II Semester": ["Discrete Mathematics", "Business Economics & Financial Analysis", "Operating Systems", "Computer Networks", "Software Engineering", "Operating Systems Lab", "Computer Networks Lab", "Real-time Research Project / Field Based Project", "Node JS / React JS / Django"],
  "III Year I Semester": ["Network Security and Cryptography", "Database Management Systems", "Formal Languages and Automata Theory", "Professional Elective-I", "Professional Elective-II", "Network Security and Cryptography Lab", "Database Management Systems Lab", "Advanced English Communication Skills Lab", "UI design - Flutter"],
  "III Year II Semester": ["Cyber Security Essentials", "Cyber Crime Investigation & Digital Forensics", "Algorithms Design and Analysis", "Professional Elective-III", "Open Elective-I", "Cyber Security Essentials Lab", "Cyber Crime Investigation & Digital Forensics Lab", "Industrial Oriented Mini Project / Summer Internship"],
  "IV Year I Semester": ["Vulnerability Assessment & Penetration Testing", "Network Management Systems and Operations", "Professional Elective-IV", "Professional Elective-V", "Open Elective-II", "Vulnerability Assessment & Penetration Testing Lab", "Network Management Systems and Operations Lab", "Project Stage-I"],
  "IV Year II Semester": ["Organizational Behavior", "Professional Elective-VI", "Open Elective-III", "Project Stage-II"]
};

// 10. CSE (Regular / General)
export const cseRegularSubjects = {
  "I Year I Semester": ["Matrices and Calculus", "Engineering Chemistry", "Programming for Problem Solving", "Basic Electrical Engineering", "Computer Aided Engineering Graphics", "Elements of Computer Science & Engineering", "Engineering Chemistry Laboratory", "Programming for Problem Solving Laboratory", "Basic Electrical Engineering Laboratory"],
  "I Year II Semester": ["Ordinary Differential Equations and Vector Calculus", "Applied Physics", "Engineering Workshop", "English for Skill Enhancement", "Electronic Devices and Circuits", "Python Programming Laboratory", "Applied Physics Laboratory", "English Language and Communication Skills Laboratory", "IT Workshop"],
  "II Year I Semester": ["Digital Electronics", "Data Structures", "Computer Oriented Statistical Methods", "Computer Organization and Architecture", "Object Oriented Programming through Java", "Data Structures Lab", "Object Oriented Programming through Java Lab", "Data visualization - R Programming / Power BI"],
  "II Year II Semester": ["Discrete Mathematics", "Business Economics & Financial Analysis", "Operating Systems", "Database Management Systems", "Software Engineering", "Operating Systems Lab", "Database Management Systems Lab", "Real-time Research Project / Societal Related Project", "Node JS / React JS / Django"],
  "III Year I Semester": ["Design and Analysis of Algorithms", "Computer Networks", "DevOps", "Professional Elective-I", "Professional Elective-II", "Computer Networks Lab", "DevOps Lab", "Advanced English Communication Skills Lab", "UI design - Flutter"],
  "III Year II Semester": ["Machine Learning", "Formal Languages and Automata Theory", "Artificial Intelligence", "Professional Elective-III", "Open Elective-I", "Machine Learning Lab", "Artificial Intelligence Laboratory", "Industrial Oriented Mini Project / Internship / Skill"],
  "IV Year I Semester": ["Cryptography and Network Security", "Compiler Design", "Professional Elective-IV", "Professional Elective-V", "Open Elective-II", "Cryptography and Network Security Lab", "Compiler Design Lab", "Project Stage-I"],
  "IV Year II Semester": ["Organizational Behavior", "Professional Elective-VI", "Open Elective-III", "Project Stage-II"]
};

// 11. Biotechnology (BT)
export const bioSubjects = {
  "I Year I Semester": ["Fundamentals of Electrical and Electronics Engineering", "Applied Physics", "C Programming & Data Structures", "Engineering Workshop", "English for Skill Enhancement", "Basic Mathematics / Engineering Biology", "Applied Physics Laboratory", "English Language and Communication Skills Laboratory", "C Programming & Data Structures Laboratory", "Induction Programme"],
  "I Year II Semester": ["Matrices & Ordinary Differential Equations", "Engineering Chemistry", "Engineering Graphics", "Cell Biology", "Biostatistics", "Python Programming Laboratory", "Engineering Chemistry Laboratory", "Cell Biology Laboratory", "Electrical and Electronics Engineering Laboratory"],
  "II Year I Semester": ["Biochemistry", "Microbiology", "Engineering Mathematics - II", "Fluid Mechanics & Heat Transfer", "Artificial Intelligence and Machine Learning", "Fluid Mechanics & Heat Transfer Lab", "Microbiology and Biochemistry Lab", "Artificial Intelligence and Machine Learning Lab", "Environmental Science"],
  "II Year II Semester": ["Enzyme Engineering and Technology", "Molecular Biology & Genetics", "Mathematics – III", "Business Economics & Financial Analysis", "Chemical Reaction Engineering", "Molecular Biology Lab", "Chemical Reaction Engineering Lab", "Enzyme Engineering and Technology Lab", "Mini Project - Society Related / Field Based Project"],
  "III Year I Semester": ["Analytical Techniques in Biotechnology", "Chemical and Biochemical Thermodynamics", "Bioprocess Engineering", "Genetic Engineering", "Immunology", "Analytical Techniques Lab", "Bioprocess Engineering Lab", "Genetic Engineering and Immunology Lab", "Intellectual Property Rights"],
  "III Year II Semester": ["Mass Transfer Operations", "Bioinformatics", "Down Stream Processing", "Professional Elective – I", "Open Elective - I", "Mass Transfer Operations & Down Stream Processing Lab", "Advanced English Communication Lab", "Bioinformatics Lab", "Industry Oriented Mini Project / Internship", "Constitution of India"],
  "IV Year I Semester": ["Biosafety, Bioethics and Regulatory Affairs", "Industrial Management", "Professional Elective – II", "Professional Elective – III", "Professional Elective – IV", "Open Elective - II", "Project Stage-I"],
  "IV Year II Semester": ["Professional Elective – V", "Professional Elective – VI", "Open Elective - III", "Project Stage-II"]
};

// Master Record for subjectsByBranchAndSemester
export const subjectsByBranchAndSemester: Record<string, Record<string, string[]>> = {
  "Civil Engineering": civilSubjects,
  "Electrical & Electronics Engineering": eeeSubjects,
  "Mechanical Engineering": mechSubjects,
  "Electronics & Communication Engineering": eceSubjects,
  "Chemical Engineering": chemSubjects,
  "Geoinformatics": geoSubjects,
  "Metallurgical Engineering": metSubjects,
  "CSE (Artificial Intelligence & Machine Learning)": cseAimlSubjects,
  "CSE (Cyber Security)": cseCyberSubjects,
  "CSE (Regular / General)": cseRegularSubjects,
  "Biotechnology": bioSubjects
};

// Flat array of all subjects for validation
export const subjects = Array.from(new Set(
  Object.values(subjectsByBranchAndSemester).flatMap(branch => 
    Object.values(branch).flat()
  )
));

// Schemas for validation
export const semesterSchema = z.enum(semesters as [string, ...string[]]);
export const branchSchema = z.enum(branches as [string, ...string[]]);
export const subjectSchema = z.enum(subjects as [string, ...string[]]);
export const categorySchema = z.enum(["exam", "textbook"]);

export type Semester = z.infer<typeof semesterSchema>;
export type Branch = z.infer<typeof branchSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type Category = z.infer<typeof categorySchema>;
