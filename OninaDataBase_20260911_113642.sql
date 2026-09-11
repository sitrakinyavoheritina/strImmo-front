--
-- PostgreSQL database dump
--

\restrict dOnuiE0XWGGhh1cjk1GzDgY1pJr1DQDBz77al9EwgFeoaenxFP9UL6xxab3YzSZ

-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS "OninaDataBase";
--
-- Name: OninaDataBase; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE "OninaDataBase" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'fr_FR.UTF-8';


\unrestrict dOnuiE0XWGGhh1cjk1GzDgY1pJr1DQDBz77al9EwgFeoaenxFP9UL6xxab3YzSZ
\connect "OninaDataBase"
\restrict dOnuiE0XWGGhh1cjk1GzDgY1pJr1DQDBz77al9EwgFeoaenxFP9UL6xxab3YzSZ

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: agency_profiles_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.agency_profiles_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: agent_profiles_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.agent_profiles_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: house_details_bathroom_location_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.house_details_bathroom_location_enum AS ENUM (
    'interior',
    'exterior'
);


--
-- Name: house_details_water_source_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.house_details_water_source_enum AS ENUM (
    'jirama',
    'well',
    'other'
);


--
-- Name: land_details_legal_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.land_details_legal_status_enum AS ENUM (
    'titled',
    'cadastre',
    'fitanolorana',
    'other'
);


--
-- Name: notifications_kind_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notifications_kind_enum AS ENUM (
    'listing_rejected',
    'listing_approved',
    'new_message',
    'other'
);


--
-- Name: properties_kind_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.properties_kind_enum AS ENUM (
    'sale',
    'rent'
);


--
-- Name: properties_moderation_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.properties_moderation_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: properties_property_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.properties_property_type_enum AS ENUM (
    'house',
    'apartment',
    'villa',
    'land'
);


--
-- Name: residential_details_room_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.residential_details_room_type_enum AS ENUM (
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    'T6plus'
);


--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_role_enum AS ENUM (
    'owner',
    'tenant',
    'agent',
    'agency',
    'admin',
    'superadmin'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agency_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agency_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    agency_name character varying NOT NULL,
    address character varying NOT NULL,
    nif_url character varying NOT NULL,
    stat_url character varying NOT NULL,
    status public.agency_profiles_status_enum DEFAULT 'pending'::public.agency_profiles_status_enum NOT NULL,
    rejection_reason character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: agent_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    cin_recto_url character varying NOT NULL,
    cin_verso_url character varying NOT NULL,
    status public.agent_profiles_status_enum DEFAULT 'pending'::public.agent_profiles_status_enum NOT NULL,
    rejection_reason character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_a_id uuid NOT NULL,
    user_b_id uuid NOT NULL,
    property_id uuid,
    last_message_text text,
    last_message_at timestamp without time zone,
    last_sender_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    property_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: house_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_details (
    property_id uuid NOT NULL,
    bedrooms integer NOT NULL,
    has_car_access boolean DEFAULT false NOT NULL,
    has_motorbike_access boolean DEFAULT false NOT NULL,
    water_source public.house_details_water_source_enum NOT NULL,
    bathroom_location public.house_details_bathroom_location_enum NOT NULL,
    has_individual_meter boolean DEFAULT false NOT NULL
);


--
-- Name: land_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.land_details (
    property_id uuid NOT NULL,
    legal_status public.land_details_legal_status_enum NOT NULL,
    has_car_access boolean DEFAULT false NOT NULL,
    is_residential_area boolean DEFAULT false NOT NULL,
    has_water_available boolean DEFAULT false NOT NULL,
    has_electricity_available boolean DEFAULT false NOT NULL,
    is_build_ready boolean DEFAULT false NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    text text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    read_at timestamp without time zone,
    image_url text
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    kind public.notifications_kind_enum NOT NULL,
    title character varying NOT NULL,
    body text NOT NULL,
    property_id uuid,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: password_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying NOT NULL,
    password_hash character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.properties (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_type public.properties_property_type_enum NOT NULL,
    kind public.properties_kind_enum NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    price numeric(14,2) NOT NULL,
    location character varying NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    available boolean DEFAULT true NOT NULL,
    phone2 character varying,
    commission numeric(14,2),
    caution numeric(14,2),
    moderation_status public.properties_moderation_status_enum DEFAULT 'pending'::public.properties_moderation_status_enum NOT NULL,
    rejection_reason text,
    view_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: property_edit_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_edit_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id character varying NOT NULL,
    edited_by_user_id character varying NOT NULL,
    changes jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: property_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_photos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    url character varying NOT NULL,
    is_cover boolean DEFAULT false NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    property_id uuid
);


--
-- Name: residential_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.residential_details (
    property_id uuid NOT NULL,
    surface_m2 integer NOT NULL,
    is_independent boolean DEFAULT false NOT NULL,
    room_type public.residential_details_room_type_enum NOT NULL,
    parking_spots integer DEFAULT 0 NOT NULL,
    is_furnished boolean DEFAULT false NOT NULL,
    has_comfort boolean DEFAULT false NOT NULL,
    has_caretaker_annex boolean DEFAULT false NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone character varying,
    email character varying,
    password character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    avatar_url character varying,
    address character varying,
    role public.users_role_enum DEFAULT 'owner'::public.users_role_enum NOT NULL,
    is_phone_verified boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: agency_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agency_profiles (id, agency_name, address, nif_url, stat_url, status, rejection_reason, created_at, updated_at, user_id) FROM stdin;
dc016e8d-7325-42c9-8248-e24560268957	Immo Test	Antananarivo	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/80fa49ba-504b-4317-ab88-95ffda8ee10f.webp	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/0a7ebea8-a5bf-4209-aa47-087f90a0b1b1.webp	pending	\N	2026-09-09 21:32:57.209625	2026-09-09 21:32:57.209625	6cc18d1e-d38e-4cd5-8025-a9d777f3e8e5
\.


--
-- Data for Name: agent_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agent_profiles (id, cin_recto_url, cin_verso_url, status, rejection_reason, created_at, updated_at, user_id) FROM stdin;
e97d06c7-0ef8-4c63-b9f1-acb379ab9d18	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/d00a43ca-f281-4661-b005-075de3619817.webp	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/37abf720-70cc-4690-ae5b-e4dbdde1562f.webp	pending	\N	2026-09-09 21:32:56.266242	2026-09-09 21:32:56.266242	0adcd74e-e7dd-451d-bc67-e4aebc127e1c
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, user_a_id, user_b_id, property_id, last_message_text, last_message_at, last_sender_id, created_at) FROM stdin;
886cb299-afac-4073-8e6d-25eafbb65d0b	defdbb5b-8015-492d-9b7d-ec3688caf6c0	65c772d1-18be-411d-86c3-8df8b1d5be2d	\N	Bonjour, la maison est-elle disponible ?	2026-09-08 20:53:25.487	65c772d1-18be-411d-86c3-8df8b1d5be2d	2026-09-08 20:53:25.4528
a1d380ac-9a73-43d9-8fca-6e56ab8633cc	5649cb3a-d729-4e96-8890-d311bf95aba2	04ae0d37-df60-4710-a60d-9b7140add084	\N	Bonjour, la maison est-elle disponible ?	2026-09-08 21:39:04.923	04ae0d37-df60-4710-a60d-9b7140add084	2026-09-08 21:39:04.890934
5e5408c2-0a02-4953-8592-7a27112fe530	af3b0f55-5f7f-46ee-9309-e09216466eb4	1f71c164-c3e2-4096-b32f-95a99b19efb4	1da1a4ea-0345-43dd-a1f1-c9f1220b0115	\N	\N	\N	2026-09-08 21:44:05.900358
6e5f88b7-c99f-4cf0-a414-1089c2d3ec8d	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	1f71c164-c3e2-4096-b32f-95a99b19efb4	1da1a4ea-0345-43dd-a1f1-c9f1220b0115	bbbbb	2026-09-10 17:30:37.085	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	2026-09-08 22:34:53.955356
1af69abb-d745-44af-9290-b77787871fbc	524b5e44-9b5c-4389-af43-ed63b612b3ba	0235f400-c6c8-4807-a09f-1bb1e8263b8d	\N	\N	\N	\N	2026-09-08 23:14:22.334185
b8274dee-f8d9-419b-8a9f-7475c561d749	5f8c3089-4f2b-4999-b950-48e4af03fc77	a568b46a-7076-4cf1-aa37-0c6d7dc1001d	\N	📷 Photo	2026-09-08 23:15:20.544	a568b46a-7076-4cf1-aa37-0c6d7dc1001d	2026-09-08 23:15:18.004852
85147d2c-2478-4938-8a32-6206bdd137b9	939c159f-020f-4fb7-a008-63148db3eb1d	0e67f13a-6230-49c2-9733-cdbe17a33b07	\N	\N	\N	\N	2026-09-10 16:31:34.235669
a51f5207-4f57-4667-87b7-0b6f7e6fb0c8	939c159f-020f-4fb7-a008-63148db3eb1d	0e67f13a-6230-49c2-9733-cdbe17a33b07	\N	\N	\N	\N	2026-09-10 16:31:43.33883
78b8bd0f-1e7b-4085-aae6-913390e8a84b	e17c1558-c57c-4478-b0c4-c66723fa887f	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	efa ato za	2026-09-11 10:04:39.725	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	2026-09-08 22:39:05.009368
21a75e69-627a-4633-b369-3a7c3764de4c	e17c1558-c57c-4478-b0c4-c66723fa887f	0adcd74e-e7dd-451d-bc67-e4aebc127e1c	87fcf324-9a7f-4c18-98f3-f34f81fba4ba	\N	\N	\N	2026-09-10 17:17:31.002162
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favorites (id, user_id, property_id, created_at) FROM stdin;
\.


--
-- Data for Name: house_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.house_details (property_id, bedrooms, has_car_access, has_motorbike_access, water_source, bathroom_location, has_individual_meter) FROM stdin;
96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	15	t	t	jirama	interior	t
dd73c760-7e0e-4005-ac32-a633937948d4	3	f	f	jirama	interior	f
8fb5d3ba-1f24-453a-a5f4-a9d130f44367	3	f	f	jirama	interior	f
d68a536f-6ab5-4f79-8e53-97587653ba17	3	f	f	jirama	interior	f
91426dfa-97e9-4f46-9f01-df06869d6e1f	3	t	f	jirama	interior	t
88e4def8-434f-420b-b94c-575808e53b0f	4	t	t	well	exterior	t
f8c0578a-7121-401b-bc25-f91f8a96d3a1	2	f	t	jirama	interior	f
7e8abc1d-9cba-447b-866b-4f348ecc8204	5	t	t	well	exterior	f
\.


--
-- Data for Name: land_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.land_details (property_id, legal_status, has_car_access, is_residential_area, has_water_available, has_electricity_available, is_build_ready) FROM stdin;
1da1a4ea-0345-43dd-a1f1-c9f1220b0115	titled	f	f	f	f	f
00233c0b-b3b3-437a-8294-0d5217df4008	fitanolorana	t	t	t	t	t
f3167182-9f83-4d0e-ac9b-1481fa95cc9e	titled	t	t	t	t	t
6f2a4b2e-1a8b-4987-b248-f7acb92e8ed5	cadastre	t	f	f	f	f
880821f0-aee3-445f-91dd-4f294d26c505	fitanolorana	t	f	t	f	f
4d0fcd0b-4c17-401f-8295-1fe404a100e3	titled	t	t	t	f	f
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, sender_id, text, created_at, read_at, image_url) FROM stdin;
9252ae41-532b-44fb-97e1-760963b03e85	886cb299-afac-4073-8e6d-25eafbb65d0b	65c772d1-18be-411d-86c3-8df8b1d5be2d	Bonjour, la maison est-elle disponible ?	2026-09-08 20:53:25.487809	2026-09-08 20:53:25.507	\N
0b52efb6-5538-4617-bf6e-793004f74a9f	a1d380ac-9a73-43d9-8fca-6e56ab8633cc	04ae0d37-df60-4710-a60d-9b7140add084	Bonjour, la maison est-elle disponible ?	2026-09-08 21:39:04.923352	2026-09-08 21:39:04.94	\N
6faede65-8cc3-42c3-9424-06aa03e0d651	6e5f88b7-c99f-4cf0-a414-1089c2d3ec8d	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	bonjour	2026-09-08 22:35:04.373222	\N	\N
faa488c4-4b07-4160-811a-943f74108590	6e5f88b7-c99f-4cf0-a414-1089c2d3ec8d	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	ca va	2026-09-08 22:35:18.068259	\N	\N
5087a9dd-431d-4770-931c-3eced7dce718	78b8bd0f-1e7b-4085-aae6-913390e8a84b	e17c1558-c57c-4478-b0c4-c66723fa887f	bonjour 01	2026-09-08 22:39:17.460869	2026-09-08 22:39:42.259	\N
1500a4f4-d287-44f0-a36c-3721cb422244	78b8bd0f-1e7b-4085-aae6-913390e8a84b	e17c1558-c57c-4478-b0c4-c66723fa887f	Donc	2026-09-08 22:58:13.769431	2026-09-08 22:58:45.616	\N
0c07f2e8-ad6d-4753-86c5-26b30689b974	78b8bd0f-1e7b-4085-aae6-913390e8a84b	e17c1558-c57c-4478-b0c4-c66723fa887f	Mbola dispo ve ilay trano t3 io azafady	2026-09-08 22:58:39.217833	2026-09-08 22:58:45.616	\N
cbe278a3-4e40-457e-b486-8b7dffa19f9b	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	tena efa lasa io r se a	2026-09-08 22:59:04.6087	2026-09-08 23:00:35.955	\N
53d501ef-83a9-4544-b147-a89ecb53d173	b8274dee-f8d9-419b-8a9f-7475c561d749	a568b46a-7076-4cf1-aa37-0c6d7dc1001d	\N	2026-09-08 23:15:20.54449	\N	https://res.cloudinary.com/kumjptf6/image/upload/v1788898519/onina_v1/mbmsbpvrmhwkg9dzcqft.webp
a499f7ab-911a-4cbe-84b5-afc003855fc2	78b8bd0f-1e7b-4085-aae6-913390e8a84b	e17c1558-c57c-4478-b0c4-c66723fa887f	Enao sao mahita trano hafa. Afaka maahazo sary detail ve	2026-09-08 23:00:26.164472	2026-09-08 23:15:51.133	\N
51e2eba4-8a9d-4ba1-9948-9ebed421fb3f	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	tena tsy mahita	2026-09-08 23:01:03.735725	2026-09-08 23:19:36.304	\N
b3dc8873-ce7e-467a-86e8-ddbe353db3e0	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	f aon	2026-09-08 23:27:31.244243	2026-09-08 23:31:30.112	\N
54dee4fa-e567-4dd8-865f-38995c5446d7	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	\N	2026-09-08 23:28:06.697231	2026-09-08 23:31:30.112	https://res.cloudinary.com/kumjptf6/image/upload/v1788899285/onina_v1/bwwx14rrkkcchgjjddng.webp
8ae3971f-d806-4d4e-b71e-42264462c36d	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	ajouter le style entraint d ecrire, si l utilisateur ecrit, il faut verifie la gestion de la livre la message non lu etc, j'ai deja lu un message mais dans l autre il n est pas encore vu est ouvert	2026-09-08 23:30:04.936578	2026-09-08 23:31:30.112	\N
7158672b-b9d6-45f2-a591-6b06f8344ba6	78b8bd0f-1e7b-4085-aae6-913390e8a84b	e17c1558-c57c-4478-b0c4-c66723fa887f	Ok ary eh	2026-09-08 23:27:00.067761	2026-09-08 23:58:00.387	\N
3359bb93-5336-452c-aff6-827dd234dd53	78b8bd0f-1e7b-4085-aae6-913390e8a84b	e17c1558-c57c-4478-b0c4-c66723fa887f	avy aty am test 2 faha 2	2026-09-10 17:09:52.008187	2026-09-10 17:10:16.011	\N
6beed52d-9aea-4694-a0bc-c6c05147e9ab	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	mety eh	2026-09-10 17:10:28.636546	2026-09-10 17:16:35.116	\N
54e1ea3e-a31b-4cbc-a1b8-d61cf1356526	6e5f88b7-c99f-4cf0-a414-1089c2d3ec8d	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	test hatao	2026-09-10 16:48:21.740714	\N	\N
3481421c-7b96-4cb9-bb55-ce3a6e8a8031	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	\N	2026-09-10 16:37:02.765268	2026-09-10 16:49:22.768	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/39049d95-114a-40a5-8d1a-eda684deeda5.webp
acb560a1-03b7-4ed1-8f1b-8299092160ca	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	test	2026-09-10 16:37:08.658031	2026-09-10 16:49:22.768	\N
d5e2fe33-c21c-42fe-823b-0b5bffacc226	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	ajouter un badge dans le menu message indique que tu as une nouveau mesage, notificaition aussi, supprimer le text notification dans notification, lorsqu on est dans message, rendre le menu message actif	2026-09-10 16:44:33.690916	2026-09-10 16:49:22.768	\N
9bdad150-cdae-4343-9e80-1f8626e506c5	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	avy aty am test 2	2026-09-10 16:48:32.911627	2026-09-10 16:49:22.768	\N
34bad79d-ffa7-4d4a-830d-7a261d269ed3	78b8bd0f-1e7b-4085-aae6-913390e8a84b	e17c1558-c57c-4478-b0c4-c66723fa887f	tsara	2026-09-10 17:18:13.258028	2026-09-10 17:20:34.947	\N
60a80f19-d358-470a-86f1-a61fa691763c	6e5f88b7-c99f-4cf0-a414-1089c2d3ec8d	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	bbbbb	2026-09-10 17:30:37.085909	\N	\N
3c3ae9b9-aa8e-40b3-9a31-5091ea186d74	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	tsara 2	2026-09-10 17:30:49.041186	2026-09-10 17:31:16.994	\N
ebcff192-bca7-4add-85ff-5864ee4128ca	78b8bd0f-1e7b-4085-aae6-913390e8a84b	e17c1558-c57c-4478-b0c4-c66723fa887f	\N	2026-09-10 17:34:12.736949	2026-09-10 17:42:38.877	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/6a9ed284-5a30-4d1b-916b-0f81588338ba.webp
66bb9cbd-f28d-472a-a25f-6b92da30771f	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	\N	2026-09-10 17:47:27.757064	\N	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/1f88d784-06fc-48ee-8f4f-2063cc6064a5.webp
47c7fdff-d35f-41d1-a880-905ecf0ca8f9	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	test	2026-09-10 17:47:39.767422	\N	\N
396d0a9d-960b-4937-b073-cb92860d0f28	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	\N	2026-09-10 17:54:10.408358	\N	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/25cbca4e-a98f-4018-bd49-caba9024a29d.webp
e1058d5a-fe9c-418c-afb6-b5891ddfdc87	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	\N	2026-09-10 17:55:35.386236	\N	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/1f1cd50f-14e9-4c05-ba90-0c5b7317cfb1.webp
171a4c5c-9fb3-4327-b205-753c4bd3403c	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	\N	2026-09-10 18:02:04.39939	\N	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/0f45e0ae-8d17-40e1-b36a-d4c452cfe5c7.webp
28dcd8a0-220b-4d1b-b404-0d730f5f294d	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	\N	2026-09-10 18:03:17.498928	\N	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/c4452180-2501-4f4b-8d29-abec334a2ca7.webp
efbfb688-a10e-4e9b-9866-9510011404e8	78b8bd0f-1e7b-4085-aae6-913390e8a84b	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	efa ato za	2026-09-11 10:04:39.725133	\N	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, kind, title, body, property_id, read, created_at) FROM stdin;
bd52c005-a4d6-4ef6-95ba-20450e5fbc1a	defdbb5b-8015-492d-9b7d-ec3688caf6c0	new_message	Test 2kk9ob	Bonjour, la maison est-elle disponible ?	\N	f	2026-09-08 20:53:25.499244
1c4b6590-1b0a-477a-b88d-e6ee7a5a44eb	5649cb3a-d729-4e96-8890-d311bf95aba2	new_message	Test sruwol	Bonjour, la maison est-elle disponible ?	\N	f	2026-09-08 21:39:04.933446
e8a2bf42-40c8-4b5d-af3b-67e322c7ebb3	1f71c164-c3e2-4096-b32f-95a99b19efb4	new_message	Test Un	bonjour	1da1a4ea-0345-43dd-a1f1-c9f1220b0115	f	2026-09-08 22:35:04.383493
a56f9039-aa1f-4582-b687-52805f323b61	1f71c164-c3e2-4096-b32f-95a99b19efb4	new_message	Test Un	ca va	1da1a4ea-0345-43dd-a1f1-c9f1220b0115	f	2026-09-08 22:35:18.084437
49a28950-9dac-4483-b38c-2181cf4c9205	5f8c3089-4f2b-4999-b950-48e4af03fc77	new_message	Test q57y23	📷 Photo	\N	f	2026-09-08 23:15:20.553384
9df3f653-21a7-47d7-87be-edc317b06cb2	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	tena tsy mahita	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 23:01:03.744888
90142b3b-b284-4e0f-8fb7-0892c01d64ba	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	ajouter le style entraint d ecrire, si l utilisateur ecrit, il faut verifie la gestion de la livre la message non lu etc, j'ai deja lu un message mais dans l autre il n est pas encore vu est ouvert	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 23:30:04.944747
b2049e29-9263-4c62-a1a0-f5e3a920d281	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	📷 Photo	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 23:28:06.703943
7b8baa4c-6607-4817-b0aa-f1895dd9cfa8	0029805e-1ba3-4fea-953f-bcb85459784e	new_message	MsgTestA User	Bonjour, ce bien est-il toujours disponible ?	\N	f	2026-09-10 16:22:00.202728
22f533be-8d8f-4e94-8cd6-3324e2d42e94	deb13ab4-8b66-4f49-b7b4-a71387e0ce84	new_message	MsgTestB User	Oui, toujours disponible !	\N	f	2026-09-10 16:22:01.75598
908dfe31-4f36-4f6d-b848-a8eb55bb4404	0029805e-1ba3-4fea-953f-bcb85459784e	new_message	MsgTestA User	Bonjour, ce bien est-il toujours disponible ?	\N	f	2026-09-10 16:25:58.766291
bade42a6-3864-4bc3-b65f-971482b1e011	deb13ab4-8b66-4f49-b7b4-a71387e0ce84	new_message	MsgTestB User	Oui, toujours disponible !	\N	f	2026-09-10 16:26:00.328933
59c87845-073d-4d4f-b798-6e64a309a1af	1f71c164-c3e2-4096-b32f-95a99b19efb4	new_message	Test Un	test hatao	1da1a4ea-0345-43dd-a1f1-c9f1220b0115	f	2026-09-10 16:48:21.749914
a9f07f02-f10c-4bb9-a755-daa73fa8930f	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	new_message	Test Deux	📷 Photo	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-10 17:34:12.742356
e7889bef-125a-47d3-8c66-b78259fcf855	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	new_message	Test Deux	bonjour 01	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 22:39:17.469847
7f25bae4-840e-4bf1-860d-ecb1cfa46adf	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	new_message	Test Deux	tsara	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-10 17:18:13.263739
1f48d33b-4c97-4f86-85c8-58ca3b280c14	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	new_message	Test Deux	avy aty am test 2 faha 2	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-10 17:09:52.013979
17c7c572-a8a5-489e-a512-f2b4b8d905fd	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	new_message	Test Deux	Ok ary eh	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 23:27:00.087759
6dfa99ff-d6c2-4754-8a0a-2fa808d352b2	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	new_message	Test Deux	Enao sao mahita trano hafa. Afaka maahazo sary detail ve	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 23:00:26.170998
df560951-4c04-4be4-a3d0-876fd26e5565	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	new_message	Test Deux	Donc	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 22:58:13.776204
7d36ef86-21c4-4cf6-bff6-a9118b357851	1ae0ba38-c8e7-4948-86ef-42c07f810c8e	new_message	Test Deux	Mbola dispo ve ilay trano t3 io azafady	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 22:58:39.223751
4bf313d3-04b2-4ef3-a4a4-2c28c1b14c75	1f71c164-c3e2-4096-b32f-95a99b19efb4	new_message	Test Un	bbbbb	1da1a4ea-0345-43dd-a1f1-c9f1220b0115	f	2026-09-10 17:30:37.091375
a727cc1b-1361-41a0-9ee7-1ab94caa1e6e	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	tsara 2	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-10 17:30:49.047922
6961aab6-06f5-4c60-804f-0f83bc084fa9	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	mety eh	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-10 17:10:28.642501
ae38a0fc-3ed3-44df-82dc-ca6700669ccc	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	avy aty am test 2	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-10 16:48:32.917856
f5650550-a2a3-4b33-97f3-f8bfcc2e023c	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	f aon	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 23:27:31.254186
bd73737a-e47a-4458-a0c8-717cc505e083	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	tena efa lasa io r se a	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-08 22:59:04.615836
188acc11-04da-48d0-95d1-d49508138bf1	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	📷 Photo	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-10 16:37:02.772752
9dea6d3e-37e3-4ce4-8489-9120c490a6aa	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	ajouter un badge dans le menu message indique que tu as une nouveau mesage, notificaition aussi, supprimer le text notification dans notification, lorsqu on est dans message, rendre le menu message actif	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-10 16:44:33.697901
2e266327-d71f-4083-b930-710c409efb0c	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	test	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	t	2026-09-10 16:37:08.664642
5d166826-7fd1-43ce-a7e9-4a1ee7df0b65	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	📷 Photo	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	f	2026-09-10 17:47:27.775561
66b758cd-cc9b-4016-8403-dc2180965ae0	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	test	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	f	2026-09-10 17:47:39.774335
541868cc-ddc7-4c4c-a5f3-2b3a37121eb6	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Test Un	📷 Photo	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	f	2026-09-10 17:54:10.422916
be4e3882-bc57-4f21-9ed8-0892ac99d955	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Nouveau message	Vous avez reçu un message de Test Un.	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	f	2026-09-10 17:55:35.399171
476d3c22-77ef-4e18-90ed-88e7a4fc2f64	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Nouveau message	Vous avez reçu un message de Test Un.	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	f	2026-09-10 18:02:04.40797
80e06b9f-bca1-496f-add6-dde8d287c0a5	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Nouveau message	Vous avez reçu un message de Test Un.	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	f	2026-09-10 18:03:17.509964
0a36eafb-7ceb-406b-bd37-6e07d0574d95	e17c1558-c57c-4478-b0c4-c66723fa887f	new_message	Nouveau message	Vous avez reçu un message de Test Un.	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	f	2026-09-11 10:04:39.747574
\.


--
-- Data for Name: password_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_history (id, user_id, password_hash, created_at) FROM stdin;
888b08cc-5671-47b9-a270-672f9488d5f0	e17c1558-c57c-4478-b0c4-c66723fa887f	$2b$10$N7ic.3PuMGleeDwU.0zqIeU2SvUgSNRA3BmfZpvpKtTgyWpRtqZpy	2026-09-10 12:50:20.710743
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.properties (id, property_type, kind, title, description, price, location, latitude, longitude, available, phone2, commission, caution, moderation_status, rejection_reason, view_count, created_at, updated_at, user_id) FROM stdin;
1da1a4ea-0345-43dd-a1f1-c9f1220b0115	land	sale	Terrain test smoke	Terrain de test pour la messagerie.	15000000.00	Antananarivo	\N	\N	t	\N	\N	\N	approved	\N	0	2026-09-08 21:44:03.333478	2026-09-08 22:34:06.341008	1f71c164-c3e2-4096-b32f-95a99b19efb4
96f8fb39-9169-49d5-8e6a-53c3cc81d8d4	house	rent	Maison avec 15 chambres et accès voiture	tena mora be ity toerana ity	150000.00	bord de la mer, mahanjanga	\N	\N	t	\N	\N	\N	approved	\N	0	2026-09-08 22:38:16.60112	2026-09-08 22:38:42.329059	1ae0ba38-c8e7-4948-86ef-42c07f810c8e
dd73c760-7e0e-4005-ac32-a633937948d4	house	rent	Maison avec 3 chambres et eau JIRAMA	Belle maison de test créée automatiquement pour vérifier le flux de publication.	450000.00	Ivandry, Antananarivo (test)	\N	\N	t	\N	\N	\N	pending	\N	0	2026-09-10 10:46:52.807607	2026-09-10 10:46:52.807607	70206ba0-810a-426f-81cf-7b3a1196b262
8fb5d3ba-1f24-453a-a5f4-a9d130f44367	house	rent	Maison avec 3 chambres et eau JIRAMA	Description test.	450000.00	Test loc	\N	\N	t	\N	\N	\N	pending	\N	0	2026-09-10 10:47:20.116865	2026-09-10 10:47:20.116865	9ba16653-6666-4454-add4-66bc12f7c53c
d68a536f-6ab5-4f79-8e53-97587653ba17	house	rent	Maison avec 3 chambres et eau JIRAMA	Belle maison de test créée automatiquement pour vérifier le flux de publication.	450000.00	Ivandry, Antananarivo (test)	\N	\N	t	\N	\N	\N	pending	\N	0	2026-09-10 10:50:03.635672	2026-09-10 10:50:03.635672	d7ebe27d-735f-4a0e-8f54-2cef09edddc4
00233c0b-b3b3-437a-8294-0d5217df4008	land	rent	Terrain avec fitanolorana et accès voiture	tena tsara be io toerana io	150000.00	ankdindratombo antananarivo	\N	\N	t	\N	\N	\N	pending	\N	0	2026-09-10 10:52:25.64912	2026-09-10 10:52:25.64912	e17c1558-c57c-4478-b0c4-c66723fa887f
80135faf-75e4-4f9a-9fdd-1d6ff011fdf0	apartment	rent	Appartement T3 avec 150 m² et 15 parkings	test mail	150000.00	antananarivo	\N	\N	t	\N	\N	\N	pending	\N	0	2026-09-10 12:48:06.642489	2026-09-10 12:48:06.642489	e17c1558-c57c-4478-b0c4-c66723fa887f
91426dfa-97e9-4f46-9f01-df06869d6e1f	house	rent	Belle maison familiale à Ivandry	Maison lumineuse avec jardin arboré, proche des écoles internationales et des commerces. Quartier calme et sécurisé.	450000.00	Ivandry, Antananarivo	\N	\N	t	\N	\N	\N	approved	\N	812	2026-09-08 15:15:42.01132	2026-09-08 15:15:42.01132	1ae0ba38-c8e7-4948-86ef-42c07f810c8e
88e4def8-434f-420b-b94c-575808e53b0f	house	sale	Maison spacieuse à Ankorondrano	Grande maison familiale avec compteur individuel, idéale pour une grande famille. Accès facile aux bureaux du centre-ville.	180000000.00	Ankorondrano, Antananarivo	\N	\N	t	\N	\N	\N	approved	\N	340	2026-08-31 15:15:42.01132	2026-08-31 15:15:42.01132	e17c1558-c57c-4478-b0c4-c66723fa887f
f8c0578a-7121-401b-bc25-f91f8a96d3a1	house	rent	Maison cosy à Isoraka	Petite maison de charme au cœur d'Isoraka, à deux pas du centre-ville. Idéale pour un jeune couple ou une petite famille.	320000.00	Isoraka, Antananarivo	\N	\N	t	\N	\N	\N	approved	\N	156	2026-09-05 15:15:42.01132	2026-09-05 15:15:42.01132	c6c24fe1-1b2c-4679-b978-8ca0f8f0e950
87fcf324-9a7f-4c18-98f3-f34f81fba4ba	apartment	rent	Appartement T3 meublé à Ambatobe	Bel appartement meublé avec confort, deux places de parking sécurisées. Résidence calme avec gardien.	550000.00	Ambatobe, Antananarivo	\N	\N	t	0341234567	55000.00	550000.00	approved	\N	421	2026-09-09 15:15:42.01132	2026-09-09 15:15:42.01132	0adcd74e-e7dd-451d-bc67-e4aebc127e1c
1127643b-f8ec-42a9-bc85-88d9cd74c07e	apartment	sale	Appartement T2 au cœur d'Analakely	Appartement idéalement situé en plein centre-ville, proche de tous les commerces et transports.	95000000.00	Analakely, Antananarivo	\N	\N	t	\N	\N	\N	approved	\N	267	2026-08-26 15:15:42.01132	2026-08-26 15:15:42.01132	1ae0ba38-c8e7-4948-86ef-42c07f810c8e
447e9493-93fa-4349-b112-a5d793999f2c	apartment	rent	Grand T4 meublé face à la mer, Toamasina	Superbe appartement avec vue sur l'océan, entièrement meublé et équipé. Une place de parking incluse.	400000.00	Toamasina	\N	\N	t	\N	\N	\N	approved	\N	198	2026-09-03 15:15:42.01132	2026-09-03 15:15:42.01132	e17c1558-c57c-4478-b0c4-c66723fa887f
ad14e8ea-b16b-48dc-896b-aa033e7270ac	villa	sale	Villa de standing avec piscine, Ivandry	Somptueuse villa T5 indépendante avec piscine, jardin paysager et dépendance pour le personnel. Trois places de parking.	650000000.00	Ivandry, Antananarivo	\N	\N	t	0342345678	32500000.00	5000000.00	approved	\N	903	2026-09-07 15:15:42.01132	2026-09-07 15:15:42.01132	6cc18d1e-d38e-4cd5-8025-a9d777f3e8e5
d2de2d5c-3c39-489b-88a8-fe25bb26ae93	villa	rent	Villa confortable à Mahajanga	Villa T4 avec beaucoup de confort, proche de la plage. Deux places de parking, jardin entretenu.	1200000.00	Mahajanga	\N	\N	t	\N	\N	\N	approved	\N	512	2026-08-21 15:15:42.01132	2026-08-21 15:15:42.01132	c6c24fe1-1b2c-4679-b978-8ca0f8f0e950
0cd373e0-b941-4c3c-ac4a-4a4814a989d8	villa	sale	Villa de luxe indépendante, Nosy Be	Exceptionnelle villa T6+ avec vue mer, entièrement indépendante, grand confort et dépendance. Idéale pour investisseur.	950000000.00	Nosy Be	\N	\N	t	0343456789	47500000.00	8000000.00	approved	\N	1247	2026-08-16 15:15:42.01132	2026-08-16 15:15:42.01132	6cc18d1e-d38e-4cd5-8025-a9d777f3e8e5
f3167182-9f83-4d0e-ac9b-1481fa95cc9e	land	sale	Terrain titré et borné à Ambohibao	Beau terrain plat, viabilisé (eau et électricité disponibles), prêt à bâtir. Titre foncier en règle.	45000.00	Ambohibao, Antananarivo	\N	\N	t	\N	\N	\N	approved	\N	389	2026-09-06 15:15:42.01132	2026-09-06 15:15:42.01132	1ae0ba38-c8e7-4948-86ef-42c07f810c8e
6f2a4b2e-1a8b-4987-b248-f7acb92e8ed5	land	sale	Terrain au cadastre, Toliara	Grand terrain proche du centre-ville, en cadastre, pas encore viabilisé. Bon potentiel pour projet immobilier.	12000.00	Toliara	\N	\N	t	\N	\N	\N	approved	\N	134	2026-08-29 15:15:42.01132	2026-08-29 15:15:42.01132	e17c1558-c57c-4478-b0c4-c66723fa887f
880821f0-aee3-445f-91dd-4f294d26c505	land	sale	Terrain agricole avec fitanolorana, Antsirabe	Vaste terrain en zone rurale, statut fitanolorana, accès voiture. Idéal pour exploitation agricole.	8000.00	Antsirabe	\N	\N	t	\N	\N	\N	approved	\N	76	2026-08-23 15:15:42.01132	2026-08-23 15:15:42.01132	c6c24fe1-1b2c-4679-b978-8ca0f8f0e950
7e8abc1d-9cba-447b-866b-4f348ecc8204	house	sale	Grande maison à Fianarantsoa	Maison familiale de 5 chambres avec accès voiture et moto, puits privé. Beaucoup de terrain autour.	220000000.00	Fianarantsoa	\N	\N	t	\N	\N	\N	approved	\N	245	2026-09-01 15:15:42.01132	2026-09-01 15:15:42.01132	1ae0ba38-c8e7-4948-86ef-42c07f810c8e
e736ff9c-2a4d-4546-b328-c0fa00123d26	apartment	rent	Studio T1 meublé, Ankorondrano	Petit studio meublé et fonctionnel, parfait pour un étudiant ou jeune actif. Quartier des affaires à proximité.	280000.00	Ankorondrano, Antananarivo	\N	\N	t	0344567890	28000.00	280000.00	approved	\N	302	2026-09-04 15:15:42.01132	2026-09-04 15:15:42.01132	0adcd74e-e7dd-451d-bc67-e4aebc127e1c
909ad362-7c9a-4266-9de6-eb822d3b8518	villa	rent	Villa moderne T4 à Ivandry	Villa récente avec beaucoup de confort, deux places de parking. Quartier prisé, proche des ambassades.	1800000.00	Ivandry, Antananarivo	\N	\N	t	\N	\N	\N	approved	\N	678	2026-09-09 15:15:42.01132	2026-09-09 15:15:42.01132	e17c1558-c57c-4478-b0c4-c66723fa887f
4d0fcd0b-4c17-401f-8295-1fe404a100e3	land	sale	Terrain résidentiel titré, Andraisoro	Terrain dans un quartier résidentiel calme, eau disponible sur place. Bon accès voiture toute l'année.	30000.00	Andraisoro, Antananarivo	\N	\N	t	\N	\N	\N	approved	\N	210	2026-08-27 15:15:42.01132	2026-08-27 15:15:42.01132	c6c24fe1-1b2c-4679-b978-8ca0f8f0e950
\.


--
-- Data for Name: property_edit_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_edit_history (id, property_id, edited_by_user_id, changes, created_at) FROM stdin;
\.


--
-- Data for Name: property_photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_photos (id, url, is_cover, "position", created_at, property_id) FROM stdin;
6673f8c9-daf3-469c-be92-daf5f2231a7f	https://res.cloudinary.com/kumjptf6/image/upload/v1788893044/onina_v1/jjgp7tzx1zzmn6tyvwlz.webp	t	0	2026-09-08 21:44:05.875534	1da1a4ea-0345-43dd-a1f1-c9f1220b0115
fb8800b5-fcb5-455e-8164-4a1dbca9b08b	https://res.cloudinary.com/kumjptf6/image/upload/v1788893044/onina_v1/wl7iycdun42zbmnyjqye.webp	f	1	2026-09-08 21:44:05.875534	1da1a4ea-0345-43dd-a1f1-c9f1220b0115
3299455a-7cb8-492d-b712-c5ebb7124ae2	https://res.cloudinary.com/kumjptf6/image/upload/v1788893044/onina_v1/f0u25fsp8iy6rgxmw6re.webp	f	2	2026-09-08 21:44:05.875534	1da1a4ea-0345-43dd-a1f1-c9f1220b0115
2ba612cc-6d28-4a80-9c84-67a6d1404396	https://res.cloudinary.com/kumjptf6/image/upload/v1788896298/onina_v1/ogctl15cqgabtq9mgqok.webp	t	0	2026-09-08 22:38:21.010242	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4
5bcf28ee-1af1-4023-936c-21ea113b8cd3	https://res.cloudinary.com/kumjptf6/image/upload/v1788896299/onina_v1/jpgapy7ce7ncb4zpxnoz.webp	f	1	2026-09-08 22:38:21.010242	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4
fb57924c-f074-40c0-b735-b6019e624136	https://res.cloudinary.com/kumjptf6/image/upload/v1788896298/onina_v1/hyqevf3cflrp9m2gq1i2.webp	f	2	2026-09-08 22:38:21.010242	96f8fb39-9169-49d5-8e6a-53c3cc81d8d4
07b4ab1b-c3b3-4863-a993-0b4baa0727f5	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/90ab8c7b-6aaa-4dd1-bde9-dee90cec64e2.webp	t	0	2026-09-10 10:46:53.967892	dd73c760-7e0e-4005-ac32-a633937948d4
b97c78b9-d5fd-4ffa-a7ed-0895efa30675	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/659147c8-378a-4edc-bc90-6e882c9666d9.webp	f	1	2026-09-10 10:46:53.967892	dd73c760-7e0e-4005-ac32-a633937948d4
904231b7-36db-44eb-8800-81c8042f5b31	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/c7c78e0e-7d2b-492b-b92a-edfdf08e4819.webp	f	2	2026-09-10 10:46:53.967892	dd73c760-7e0e-4005-ac32-a633937948d4
b12402df-bb0d-46bf-bb8f-0d7a0e5936dc	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/4a774aa1-b163-4e59-be1f-2640f75f0d8d.webp	t	0	2026-09-10 10:47:21.515762	8fb5d3ba-1f24-453a-a5f4-a9d130f44367
0c224557-1e64-4e0c-a4b9-dda2a35b7904	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/745b586e-b14c-4753-8e23-a7c650db0ef1.webp	f	1	2026-09-10 10:47:21.515762	8fb5d3ba-1f24-453a-a5f4-a9d130f44367
86b84018-7ec8-47cd-94ec-79f16170ada9	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/00037ba0-f5b6-4a45-b5e1-7288ed3f040d.webp	f	2	2026-09-10 10:47:21.515762	8fb5d3ba-1f24-453a-a5f4-a9d130f44367
1fec3b98-aaac-4651-939d-318c3d25d48e	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/d092b76f-253c-41a9-bad7-45b90e32417e.webp	t	0	2026-09-10 10:50:04.548033	d68a536f-6ab5-4f79-8e53-97587653ba17
5dcb6a34-b9f4-4e2e-bdaf-a96a6eaf30df	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/045a760f-c797-4762-b093-53c089c61899.webp	f	1	2026-09-10 10:50:04.548033	d68a536f-6ab5-4f79-8e53-97587653ba17
033ed826-951f-4f74-8a6c-2c27c84a0323	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/db9f2560-6e0b-4935-856b-c6d52793978f.webp	f	2	2026-09-10 10:50:04.548033	d68a536f-6ab5-4f79-8e53-97587653ba17
6025ff4e-abea-4589-a1ee-b1df9c87f188	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/35ef9455-5a30-4552-82ee-7cb4a3c4c3e9.webp	t	0	2026-09-10 10:52:27.53086	00233c0b-b3b3-437a-8294-0d5217df4008
a4108add-2404-4ea3-8e25-8e67cb905c1e	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/5af10e95-b91d-4a18-9f0b-b59e29111979.webp	f	1	2026-09-10 10:52:27.53086	00233c0b-b3b3-437a-8294-0d5217df4008
70859dbc-4cf7-4f7c-a8bc-2f75e622c8fb	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/5f18d982-daf4-4b25-8bf2-42c5c926342d.webp	f	2	2026-09-10 10:52:27.53086	00233c0b-b3b3-437a-8294-0d5217df4008
5c723138-d792-4bf2-a497-0964e6c8765d	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/5a72ee3b-75b7-4209-a7bd-0f0ecc981e98.webp	t	0	2026-09-10 12:48:08.015514	80135faf-75e4-4f9a-9fdd-1d6ff011fdf0
123dbbd7-e2c2-41ca-9ceb-c36a853c7ab2	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/0e22cf54-bbd1-4d3f-9984-04c4c73efef2.webp	f	1	2026-09-10 12:48:08.015514	80135faf-75e4-4f9a-9fdd-1d6ff011fdf0
f1ffd675-2cf7-4656-ac5b-26c57aa08658	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/ae26c639-de25-4662-b166-c257594004dd.webp	f	2	2026-09-10 12:48:08.015514	80135faf-75e4-4f9a-9fdd-1d6ff011fdf0
d2fbfc9c-01ed-4bfe-9125-b9de4e19c446	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/659147c8-378a-4edc-bc90-6e882c9666d9.webp	f	1	2026-09-10 15:15:42.01132	91426dfa-97e9-4f46-9f01-df06869d6e1f
386b1f24-9549-4621-9361-402dfe020876	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/90ab8c7b-6aaa-4dd1-bde9-dee90cec64e2.webp	t	0	2026-09-10 15:15:42.01132	91426dfa-97e9-4f46-9f01-df06869d6e1f
5f92a9ea-7935-47af-87d4-b663d2d14465	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/4a774aa1-b163-4e59-be1f-2640f75f0d8d.webp	f	1	2026-09-10 15:15:42.01132	88e4def8-434f-420b-b94c-575808e53b0f
3e8a8d6d-0b1e-4b75-adaa-9f51b9d0538f	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/c7c78e0e-7d2b-492b-b92a-edfdf08e4819.webp	t	0	2026-09-10 15:15:42.01132	88e4def8-434f-420b-b94c-575808e53b0f
cb437732-5305-4a5e-bc0c-a9a91ea679fd	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/745b586e-b14c-4753-8e23-a7c650db0ef1.webp	t	0	2026-09-10 15:15:42.01132	f8c0578a-7121-401b-bc25-f91f8a96d3a1
edc31f5f-6c80-4121-8e81-69db2ab1b159	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/d092b76f-253c-41a9-bad7-45b90e32417e.webp	f	1	2026-09-10 15:15:42.01132	87fcf324-9a7f-4c18-98f3-f34f81fba4ba
cf108c3c-a4cf-48ec-aa28-d79c05702a33	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/00037ba0-f5b6-4a45-b5e1-7288ed3f040d.webp	t	0	2026-09-10 15:15:42.01132	87fcf324-9a7f-4c18-98f3-f34f81fba4ba
a81c74cd-94b9-4f34-b80f-2c1b9c0ade2b	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/045a760f-c797-4762-b093-53c089c61899.webp	t	0	2026-09-10 15:15:42.01132	1127643b-f8ec-42a9-bc85-88d9cd74c07e
622022e6-f8f4-4087-b5b7-e4af68fccd10	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/35ef9455-5a30-4552-82ee-7cb4a3c4c3e9.webp	f	1	2026-09-10 15:15:42.01132	447e9493-93fa-4349-b112-a5d793999f2c
3f3f3a10-fbc0-4b73-9713-aca255377ae7	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/db9f2560-6e0b-4935-856b-c6d52793978f.webp	t	0	2026-09-10 15:15:42.01132	447e9493-93fa-4349-b112-a5d793999f2c
438291a2-f86f-4e60-975b-719a4accdd81	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/5a72ee3b-75b7-4209-a7bd-0f0ecc981e98.webp	f	2	2026-09-10 15:15:42.01132	ad14e8ea-b16b-48dc-896b-aa033e7270ac
bb4f2a69-bdba-4908-be3d-598681144b46	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/5f18d982-daf4-4b25-8bf2-42c5c926342d.webp	f	1	2026-09-10 15:15:42.01132	ad14e8ea-b16b-48dc-896b-aa033e7270ac
b5c29473-5a68-4cf9-9278-3ba19bced5e5	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/5af10e95-b91d-4a18-9f0b-b59e29111979.webp	t	0	2026-09-10 15:15:42.01132	ad14e8ea-b16b-48dc-896b-aa033e7270ac
b297d7ca-6f65-4e6b-9656-21bd7ad50114	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/0e22cf54-bbd1-4d3f-9984-04c4c73efef2.webp	t	0	2026-09-10 15:15:42.01132	d2de2d5c-3c39-489b-88a8-fe25bb26ae93
b0c252e3-80dd-4d1d-83dc-8c285e71e60a	https://res.cloudinary.com/kumjptf6/image/upload/v1788893044/onina_v1/jjgp7tzx1zzmn6tyvwlz.webp	f	1	2026-09-10 15:15:42.01132	0cd373e0-b941-4c3c-ac4a-4a4814a989d8
39342512-1b54-41a0-9ede-2da58b9301c3	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/ae26c639-de25-4662-b166-c257594004dd.webp	t	0	2026-09-10 15:15:42.01132	0cd373e0-b941-4c3c-ac4a-4a4814a989d8
aeb56447-bc9b-43bb-8b38-6a72dfb320ad	https://res.cloudinary.com/kumjptf6/image/upload/v1788893044/onina_v1/wl7iycdun42zbmnyjqye.webp	t	0	2026-09-10 15:15:42.01132	f3167182-9f83-4d0e-ac9b-1481fa95cc9e
115a7409-1b1f-4c2d-9248-c6f5939f8ed1	https://res.cloudinary.com/kumjptf6/image/upload/v1788893044/onina_v1/f0u25fsp8iy6rgxmw6re.webp	t	0	2026-09-10 15:15:42.01132	6f2a4b2e-1a8b-4987-b248-f7acb92e8ed5
6f386ccb-a452-49fb-8f42-b4bb12a3c2e2	https://res.cloudinary.com/kumjptf6/image/upload/v1788896298/onina_v1/ogctl15cqgabtq9mgqok.webp	t	0	2026-09-10 15:15:42.01132	880821f0-aee3-445f-91dd-4f294d26c505
68c0dc1d-0ea2-4d22-bdc1-7afb3b26be53	https://res.cloudinary.com/kumjptf6/image/upload/v1788896298/onina_v1/hyqevf3cflrp9m2gq1i2.webp	f	1	2026-09-10 15:15:42.01132	7e8abc1d-9cba-447b-866b-4f348ecc8204
93278e1e-9946-40a3-9b3c-d8c2032abcf2	https://res.cloudinary.com/kumjptf6/image/upload/v1788896299/onina_v1/jpgapy7ce7ncb4zpxnoz.webp	t	0	2026-09-10 15:15:42.01132	7e8abc1d-9cba-447b-866b-4f348ecc8204
77168ec1-b9dd-4abf-9797-6cf5db2d3bcc	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/659147c8-378a-4edc-bc90-6e882c9666d9.webp	t	0	2026-09-10 15:15:42.01132	e736ff9c-2a4d-4546-b328-c0fa00123d26
1f6fc047-dc9a-414c-929d-c37309fbe681	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/c7c78e0e-7d2b-492b-b92a-edfdf08e4819.webp	f	1	2026-09-10 15:15:42.01132	909ad362-7c9a-4266-9de6-eb822d3b8518
94e5a015-fd48-4892-aaa7-6269bbaf9d99	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/4a774aa1-b163-4e59-be1f-2640f75f0d8d.webp	t	0	2026-09-10 15:15:42.01132	909ad362-7c9a-4266-9de6-eb822d3b8518
e3c89157-fd34-4f3e-8c86-f5304f089f6e	https://res.cloudinary.com/kumjptf6/image/upload/v1788896298/onina_v1/ogctl15cqgabtq9mgqok.webp	t	0	2026-09-10 15:15:42.01132	4d0fcd0b-4c17-401f-8295-1fe404a100e3
\.


--
-- Data for Name: residential_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.residential_details (property_id, surface_m2, is_independent, room_type, parking_spots, is_furnished, has_comfort, has_caretaker_annex) FROM stdin;
80135faf-75e4-4f9a-9fdd-1d6ff011fdf0	150	f	T3	15	t	f	f
87fcf324-9a7f-4c18-98f3-f34f81fba4ba	85	t	T3	2	t	t	f
1127643b-f8ec-42a9-bc85-88d9cd74c07e	60	f	T2	0	f	f	f
447e9493-93fa-4349-b112-a5d793999f2c	110	t	T4	1	t	t	f
ad14e8ea-b16b-48dc-896b-aa033e7270ac	320	t	T5	3	f	t	t
d2de2d5c-3c39-489b-88a8-fe25bb26ae93	250	t	T4	2	f	t	f
0cd373e0-b941-4c3c-ac4a-4a4814a989d8	400	t	T6plus	4	t	t	t
e736ff9c-2a4d-4546-b328-c0fa00123d26	35	t	T1	0	t	f	f
909ad362-7c9a-4266-9de6-eb822d3b8518	200	t	T4	2	f	t	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, phone, email, password, first_name, last_name, avatar_url, address, role, is_phone_verified, created_at, updated_at) FROM stdin;
272b6bdb-8930-44e9-8431-c55dc6538c05	+2610nbd37g1	\N	$2b$10$9ZS6J98HMezRbHYW715PU.A7idPSYEPpcP2L3GmOoJr4Vdtp91tgG	Test	nbd37g	\N	\N	owner	t	2026-09-08 20:51:18.728143	2026-09-08 20:51:18.728143
08415a12-0608-4481-b779-a25742530148	+2610nbd37g2	\N	$2b$10$t6JQU1zHceP17Ubxj5Gl5OkKMmSHsHnJKJK6HmxWIWHtzaIXldpMK	Test	nbd37g	\N	\N	owner	t	2026-09-08 20:51:18.802406	2026-09-08 20:51:18.802406
20214891-7409-4de2-baf4-39f8342c2f60	+2610mzaaj31	\N	$2b$10$F7n1g5BuiyP9sQiKyjMuhOsolSXaILskuHDUHoyVB8qeCjXFfYXqi	Test	mzaaj3	\N	\N	owner	t	2026-09-08 20:51:47.571531	2026-09-08 20:51:47.571531
44c0f6cb-60de-4cc7-82c3-44decc5ffb5d	+2610mzaaj32	\N	$2b$10$h07xJSWzlR/6q6VA4khbZO4kA2FaL/ZKOkw2OZYgqOn5HPl0Ztbp2	Test	mzaaj3	\N	\N	owner	t	2026-09-08 20:51:47.632209	2026-09-08 20:51:47.632209
defdbb5b-8015-492d-9b7d-ec3688caf6c0	+26102kk9ob1	\N	$2b$10$X4ljeZYHxJC2ZvZlFxotFepPJ/HgGJtzUs14ObrvLYT1q6j/B6t86	Test	2kk9ob	\N	\N	owner	t	2026-09-08 20:53:25.353072	2026-09-08 20:53:25.353072
65c772d1-18be-411d-86c3-8df8b1d5be2d	+26102kk9ob2	\N	$2b$10$IFIxIGvoI/a4I9dEe35XS.k.z4HLHUnux2I7hHmefP829XWc3EroO	Test	2kk9ob	\N	\N	owner	t	2026-09-08 20:53:25.432633	2026-09-08 20:53:25.432633
5649cb3a-d729-4e96-8890-d311bf95aba2	+2610sruwol1	\N	$2b$10$9vSF56xRtbxzQn8pbPdyOe1aPPBMP0dQPc/3HPljiE3hTXhKeNaVe	Test	sruwol	\N	\N	owner	t	2026-09-08 21:39:04.795401	2026-09-08 21:39:04.795401
04ae0d37-df60-4710-a60d-9b7140add084	+2610sruwol2	\N	$2b$10$gw2b4ljaBERlSB16xNbRRuMsXcaZf/3Ska3ERyi1eLzCPNHjz8MH.	Test	sruwol	\N	\N	owner	t	2026-09-08 21:39:04.872352	2026-09-08 21:39:04.872352
1f71c164-c3e2-4096-b32f-95a99b19efb4	+2610frldax9	\N	$2b$10$Z01MLa0k.eR.i5jppkPMteP9fHncI9l0Gup8HuuhAFZ4KcxqE9KN2	Test	frldax	\N	\N	owner	t	2026-09-08 21:44:03.23336	2026-09-08 21:44:03.23336
af3b0f55-5f7f-46ee-9309-e09216466eb4	+2610frldax8	\N	$2b$10$yut1zRUY1JKz0IBUbLX8Z.eqze5i9jSanfO4C.q8fq/ws2o0UxcIC	Test	frldax	\N	\N	owner	t	2026-09-08 21:44:03.305291	2026-09-08 21:44:03.305291
c6c24fe1-1b2c-4679-b978-8ca0f8f0e950	0361408972	\N	$2b$10$hbA7RMxiahQkSzT3w8r2w.BQuCSxwOGf/bgkvtxCeOWGsQEn3cTXq	TestLayout	Nouvelle	\N	\N	owner	t	2026-09-10 11:22:52.690679	2026-09-10 11:22:52.690679
6fe8e83c-f9dd-4423-aebc-65b75badecb1	034blw5ax1	jjqi1j@test.mg	$2b$10$JiNvXV2FzWsbRYOGCz4buu3PxEDzOHsRq5vHCk5UxCdP2ZnbN/M42	Updated	Owner	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/068734a2-732d-43a0-bf4b-2ac13bbda3f2.webp	\N	owner	t	2026-09-09 21:32:54.937395	2026-09-09 21:32:58.300176
62d3ad8f-2c52-4f5e-bc38-ce7745055fb2	034hm96je9	xol6km@test.mg	$2b$10$Q/0Xtn/2Ms/OmEN38eMR4.L8jcgHM73EQX6BHCmLfSYFx9ndoMtwu	Email	Login	\N	\N	owner	t	2026-09-09 21:41:08.795136	2026-09-09 21:41:08.795136
6469a322-6b59-4bc2-9c0f-b04f106cc5e0	0344740705	\N	$2b$10$SELGEqPTL3jSLwLnBjv2qeYI2ePW0dpqj2WkhQY/dPqx5OaD7A52y	TestReel	Utilisateur	\N	\N	owner	t	2026-09-09 22:27:22.822051	2026-09-09 22:27:22.822051
5d0ab5e3-3faa-45d5-9351-35a7180391ba	0340000099	\N	$2b$10$N7ic.3PuMGleeDwU.0zqIeU2SvUgSNRA3BmfZpvpKtTgyWpRtqZpy	Admin	Onina	\N	\N	admin	t	2026-09-08 21:59:03.742338	2026-09-08 21:59:03.742338
524b5e44-9b5c-4389-af43-ed63b612b3ba	+26103bc3a41	\N	$2b$10$WUMedXQYYlM6ZI9lYm8/Oe.PIOlMDKSmf0xKx7x.6kbcJ52F2ZSfW	Test	3bc3a4	\N	\N	owner	t	2026-09-08 23:14:22.244876	2026-09-08 23:14:22.244876
0235f400-c6c8-4807-a09f-1bb1e8263b8d	+26103bc3a42	\N	$2b$10$Qbm3sD4wwK8gDaoSZtmGy.he2hsLsYgTWYh7EXIbdZMLTpAIZGCZS	Test	3bc3a4	\N	\N	owner	t	2026-09-08 23:14:22.315587	2026-09-08 23:14:22.315587
5f8c3089-4f2b-4999-b950-48e4af03fc77	+2610q57y231	\N	$2b$10$.vqRcoygQ9os6Fluc2Z5su8zeACl5uAcG/bfMCCUKOxPLHzifrgk.	Test	q57y23	\N	\N	owner	t	2026-09-08 23:15:17.914913	2026-09-08 23:15:17.914913
a568b46a-7076-4cf1-aa37-0c6d7dc1001d	+2610q57y232	\N	$2b$10$FX87uU3rai3eqmtvaleSNeig5cV6zeUghgSUBL0rYKDHB.mEtHBmO	Test	q57y23	\N	\N	owner	t	2026-09-08 23:15:17.987263	2026-09-08 23:15:17.987263
89cbc47d-6135-4075-8e26-b1568dfb5f27	+2610wp0skq1	\N	$2b$10$6BTTcL2ZOWitoDoh2Xp3.O93r0XohIQ66sbfp7xph8AZ1S/0SMJ66	Test	wp0skq	\N	\N	owner	t	2026-09-09 13:56:06.071073	2026-09-09 13:56:06.071073
410415d2-f3cf-4299-9e15-0ae0b5b6d9c5	+2610yuq5in1	\N	$2b$10$KsYfMf0/GS5LJ9kDShk/eOtlaRqSxAkoy7Qo6XGf/4BFOQQlejwye	Test	yuq5in	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/827704ad-7ede-45f7-834e-be4de8d0f01d.jpg	\N	owner	t	2026-09-09 14:06:38.506388	2026-09-09 14:06:41.098943
1ae0ba38-c8e7-4948-86ef-42c07f810c8e	0340000001	\N	$2b$10$N7ic.3PuMGleeDwU.0zqIeU2SvUgSNRA3BmfZpvpKtTgyWpRtqZpy	Test	Un	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/e30ce311-f995-473b-8bdb-b87028e4d42d.jpg	\N	owner	t	2026-09-08 21:47:01.563495	2026-09-09 14:19:04.893009
3916a1d4-8862-4182-a61c-bb34e2e15f79	+2610ydgps61	\N	$2b$10$OEMzNIy0JbiSpfJNpQAIx.uRyav3uM6Xy9I559/.ncalHT9k3YgVO	Test	ydgps6	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/91b69928-0e0d-4571-a0af-09e2182faa82.webp	\N	owner	t	2026-09-09 16:13:48.143875	2026-09-09 16:13:49.641479
29d352ad-9508-424d-80f7-a86a105c3d7c	+2610iwtjhe9	\N	$2b$10$GqYmdg.PWhRQrvntXvo20OmwRssXA5IsEPkMRfGuwbsZPZspT6NIu	Test	iwtjhe	\N	\N	owner	t	2026-09-09 16:13:59.543936	2026-09-09 16:13:59.543936
8639518a-8319-42a8-a777-13258fd72e05	+2610pyu9yq7	\N	$2b$10$ET.KmKBw63g99Mi1ukystu0BNyN0y5HP1IDsJPKmOdUXgclA4vQnq	Test	pyu9yq	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/fdcea9e8-c849-452d-bd73-396a87abc532.webp	\N	owner	t	2026-09-09 16:31:12.364617	2026-09-09 16:31:15.28973
def35bf0-4b68-45ed-a43d-23d174364afe	+26101upnfn6	\N	$2b$10$eRd9uwu2nnrebJDE8B.cv.2nY.xcKODsTvfqUZYf/rKAmAJYJ28NO	Test	1upnfn	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/85cc0160-3ba6-481b-8dab-dac8862f2b55.webp	\N	owner	t	2026-09-09 16:31:45.023526	2026-09-09 16:31:46.022235
9bf99964-a0e0-49e3-bf05-69c11d1cac7d	0340egeau2	\N	$2b$10$EMup0ZNuhjN48qUTciF2SOPoWkBHeZqHRT30L0UOXnlbpbW/4h/ya	Test	Tenant	\N	\N	tenant	t	2026-09-09 21:32:55.031619	2026-09-09 21:32:55.031619
0adcd74e-e7dd-451d-bc67-e4aebc127e1c	034keyy5a3	\N	$2b$10$a/xBxR.NQvYaV5WA.m4vyeRyL47xHf94vpgHd9T3Q1.DVBsN7NbFm	Test	Agent	\N	\N	agent	t	2026-09-09 21:32:55.10626	2026-09-09 21:32:55.10626
6cc18d1e-d38e-4cd5-8025-a9d777f3e8e5	03447tkfk4	6i9syw@agency.mg	$2b$10$DcmNRo1Fyb2AjsMubMGonut36Z5ha9GxxyGvif6..3gAmln4ZS22O	Test	Agency	\N	\N	agency	t	2026-09-09 21:32:57.206689	2026-09-09 21:32:57.206689
ca2a715a-5f6c-4a7a-a804-4a11aec61a88	0347884378	\N	$2b$10$Pfgzr0/.MylR.QY9JzvWge6JSLhSWGyl8kmPx7/SzV3YZSgcEO4.m	MarkerTest	User	\N	\N	owner	t	2026-09-09 22:34:20.836775	2026-09-09 22:34:20.836775
70206ba0-810a-426f-81cf-7b3a1196b262	0343884001	\N	$2b$10$y8hlkqBo8r4ECW9iuYTVKuQbZD6HiZHEENbNgiQGQD6A6dZGzTpQi	TestCreation	Annonce	\N	\N	owner	t	2026-09-10 10:46:48.826549	2026-09-10 10:46:48.826549
9ba16653-6666-4454-add4-66bc12f7c53c	0346308258	\N	$2b$10$.qeFJq2o42MU4tPsqTQvyeVqWSACt6IY3z6V.FEn20fKeolhVJ.9q	TestCreation2	Annonce2	\N	\N	owner	t	2026-09-10 10:47:17.19911	2026-09-10 10:47:17.19911
d7ebe27d-735f-4a0e-8f54-2cef09edddc4	0349749244	\N	$2b$10$9iFKXbey3a.TwuQNNUCn..How5RmlPClPxXeZhOTPRKM6LoRiDu1S	TestCreation	Annonce	\N	\N	owner	t	2026-09-10 10:49:59.820369	2026-09-10 10:49:59.820369
ff02a742-0179-4159-b7d8-2e4d97896e9a	0331982774	\N	$2b$10$.bOxKALwwsVAk4uVaIHqVeuZ.iPexg6XYp2OEO/lUTgZE960uxhIa	TestTypes	Annonce	\N	\N	owner	t	2026-09-10 10:50:37.048356	2026-09-10 10:50:37.048356
96dfc067-5389-4252-9095-e9355e2028a9	0326185405	\N	$2b$10$1W2UvpGdzJ6c4Clm6vqAwOeZ65hfQtAYkKgbBSvEuDMbg428Xib7y	TestValid	Annonce	\N	\N	owner	t	2026-09-10 10:51:22.834487	2026-09-10 10:51:22.834487
2408686f-0be9-4d5a-be90-a4226afddc43	0387056812	\N	$2b$10$0QUExTH8lCXdWbTsIpY5OOy1tB2Vr9eHUqasxUiSnECTxf3ULrw.6	TestSidebar	Hide	\N	\N	owner	t	2026-09-10 11:05:51.647072	2026-09-10 11:05:51.647072
e7af614b-dd26-448a-9b0a-a0ef8c653db6	0389137793	\N	$2b$10$MkCcR2dJzIJQwOIalTfezOd7u9SoQKLEGBf2FdxFTqUf3MWRfDXs.	TestSidebar	Hide	\N	\N	owner	t	2026-09-10 11:06:11.720656	2026-09-10 11:06:11.720656
0187a3d9-e87c-4483-be98-32209e05ff52	0378823148	\N	$2b$10$qhuM26M4RcQdJLggnwPZn.8Y10vYcDqOUFZS7Z0nbthlOb5J.ao2C	TestBoth	Sidebars	\N	\N	owner	t	2026-09-10 11:16:47.568769	2026-09-10 11:16:47.568769
ec533994-dbca-4c02-b5d4-efc094f94ee1	0358803878	\N	$2b$10$csllyp/1J2GcOoeciIATIevCLfsP3LxcwxvnQZ.6uAoQFN8bsex6a	TestSteps	Layout	\N	\N	owner	t	2026-09-10 11:23:31.927958	2026-09-10 11:23:31.927958
e17c1558-c57c-4478-b0c4-c66723fa887f	0340000002	sitrakates@test.com	$2b$10$EOBzuE564fhdd4JJbVfZuuyqegpCDmjoJZZKy76M9JrF4yvaVNtb6	Test	Deux	https://pub-7b9dabb87c594bd98cce0a798c5b6221.r2.dev/onina_v1/dc68a3e6-6732-4833-9867-38fc1df6fb71.webp	postale	owner	t	2026-09-08 21:48:35.143028	2026-09-10 12:50:21.590792
09b1fda9-7817-492f-9dae-c4b7a8cf56d9	0396920073	\N	$2b$10$3H5eK6CIUN1bBWizoJyVreZGC9PgLVu0cZ4cOObXnKlzMRwKdfCK2	TestMenu	User	\N	\N	owner	t	2026-09-10 12:51:23.366361	2026-09-10 12:51:23.366361
0eff149f-97c6-4271-a416-5847c0f030d3	0339404158	\N	$2b$10$CuisOxK6o3rvcszwzAD7pO1odOQtf79hYzv5vPMLkEiIs0hU3NBiK	TestLogout	Redirect	\N	\N	owner	t	2026-09-10 12:57:44.036374	2026-09-10 12:57:44.036374
8982b3f6-901b-40a3-b92d-d84357e52b75	0386738828	\N	$2b$10$2hF6CFDOvYIKveBq0idVue2yufi9eptbLzupJqln4KufjMLX/HxVe	TestAuthOk	Regression	\N	\N	owner	t	2026-09-10 13:13:28.588464	2026-09-10 13:13:28.588464
9d7a897a-53e5-4f8c-a561-4ea43da7f200	0389175847	\N	$2b$10$Iplo/.1nFxQ2EssWi/w2iekhw2DGdBh6aX2ZKgyqDPZ/y1b8cpGrW	TestAuthOk	Regression	\N	\N	owner	t	2026-09-10 13:15:02.170229	2026-09-10 13:15:02.170229
f320df3e-1496-4239-aa67-0f797fb15b26	0384004673	\N	$2b$10$H3wCZQVU6.fhzJIl2Gn0qeSoJ9xeqe5m4a3aFi.HNisWvtW7qa9qK	TestAuthOk	Regression	\N	\N	owner	t	2026-09-10 13:20:33.002222	2026-09-10 13:20:33.002222
b2274eea-e1d5-4d7c-82d6-dd258bd8cbb9	03712747162	\N	$2b$10$KLO9cgX7Q9PNkQisL0XHKe/6vpgCKrOXfNeSBMHimLNtqBh5H7Woe	NavTestB	User	\N	\N	owner	t	2026-09-11 00:11:56.844722	2026-09-11 00:11:56.844722
\.


--
-- Name: property_edit_history PK_02510b36c3263e08c77a6666136; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_edit_history
    ADD CONSTRAINT "PK_02510b36c3263e08c77a6666136" PRIMARY KEY (id);


--
-- Name: messages PK_18325f38ae6de43878487eff986; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY (id);


--
-- Name: properties PK_2d83bfa0b9fcd45dee1785af44d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY (id);


--
-- Name: agent_profiles PK_4583ee140a2222f8fcecf3ac023; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT "PK_4583ee140a2222f8fcecf3ac023" PRIMARY KEY (id);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: house_details PK_748862490949ae734b5c9de0563; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_details
    ADD CONSTRAINT "PK_748862490949ae734b5c9de0563" PRIMARY KEY (property_id);


--
-- Name: property_photos PK_8010be3009e411f5682e77b65bf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_photos
    ADD CONSTRAINT "PK_8010be3009e411f5682e77b65bf" PRIMARY KEY (id);


--
-- Name: favorites PK_890818d27523748dd36a4d1bdc8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY (id);


--
-- Name: land_details PK_9c064da04a74de9ec3c41ba9af0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.land_details
    ADD CONSTRAINT "PK_9c064da04a74de9ec3c41ba9af0" PRIMARY KEY (property_id);


--
-- Name: residential_details PK_a2c46af8b123b668d68e0f80098; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.residential_details
    ADD CONSTRAINT "PK_a2c46af8b123b668d68e0f80098" PRIMARY KEY (property_id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: password_history PK_da65ed4600e5e6bc9315754a8b2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT "PK_da65ed4600e5e6bc9315754a8b2" PRIMARY KEY (id);


--
-- Name: agency_profiles PK_e3d8435f2fbb8f2133b4eb29e46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_profiles
    ADD CONSTRAINT "PK_e3d8435f2fbb8f2133b4eb29e46" PRIMARY KEY (id);


--
-- Name: conversations PK_ee34f4f7ced4ec8681f26bf04ef; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY (id);


--
-- Name: agency_profiles REL_94921e519158968ee69e6c97b4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_profiles
    ADD CONSTRAINT "REL_94921e519158968ee69e6c97b4" UNIQUE (user_id);


--
-- Name: agent_profiles REL_a3f917737285aca9254a8fa34e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT "REL_a3f917737285aca9254a8fa34e" UNIQUE (user_id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: users UQ_a000cca60bcf04454e727699490; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE (phone);


--
-- Name: favorites UQ_ca292e89ddb91e78ca404a0d268; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "UQ_ca292e89ddb91e78ca404a0d268" UNIQUE (user_id, property_id);


--
-- Name: IDX_35a6b05ee3b624d0de01ee5059; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_35a6b05ee3b624d0de01ee5059" ON public.favorites USING btree (user_id);


--
-- Name: IDX_3bc55a7c3f9ed54b520bb5cfe2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_3bc55a7c3f9ed54b520bb5cfe2" ON public.messages USING btree (conversation_id);


--
-- Name: IDX_4933dc7a01356ac0733a5ad52d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_4933dc7a01356ac0733a5ad52d" ON public.password_history USING btree (user_id);


--
-- Name: IDX_631d31d45e8f9b900e8bf913f0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_631d31d45e8f9b900e8bf913f0" ON public.conversations USING btree (user_a_id);


--
-- Name: IDX_9a8a82462cab47c73d25f49261; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON public.notifications USING btree (user_id);


--
-- Name: IDX_ce35954d8c3216fcf888337b04; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ce35954d8c3216fcf888337b04" ON public.conversations USING btree (user_b_id);


--
-- Name: house_details FK_748862490949ae734b5c9de0563; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_details
    ADD CONSTRAINT "FK_748862490949ae734b5c9de0563" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: agency_profiles FK_94921e519158968ee69e6c97b43; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_profiles
    ADD CONSTRAINT "FK_94921e519158968ee69e6c97b43" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: land_details FK_9c064da04a74de9ec3c41ba9af0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.land_details
    ADD CONSTRAINT "FK_9c064da04a74de9ec3c41ba9af0" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: residential_details FK_a2c46af8b123b668d68e0f80098; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.residential_details
    ADD CONSTRAINT "FK_a2c46af8b123b668d68e0f80098" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: agent_profiles FK_a3f917737285aca9254a8fa34ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT "FK_a3f917737285aca9254a8fa34ea" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: property_photos FK_abfcfc7d91493989c0fed11109a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_photos
    ADD CONSTRAINT "FK_abfcfc7d91493989c0fed11109a" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: properties FK_cea2dfaff2198bf6a43447f7056; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT "FK_cea2dfaff2198bf6a43447f7056" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dOnuiE0XWGGhh1cjk1GzDgY1pJr1DQDBz77al9EwgFeoaenxFP9UL6xxab3YzSZ

