import React from "react";
import { Route } from "react-router-dom";
import {
	Box,
	Heading,
	Text,
	Flex,
	InputGroup,
	Input,
	InputRightAddon,
	Button,
	useColorMode,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb
} from "@chakra-ui/core";
import CountUp from "react-countup";
import Helmet from "react-helmet";
import { useDebounce } from "use-debounce";
import LogEvent from "./LogEvent";
import ErrorMessage from "./ErrorMessage";

export default function ReturnsCalculator(props) {
	const { colorMode, toggleColorMode } = useColorMode();
	const [stakeInput, setStakeInput] = React.useState();
	const [expectedReturns, setExpectedReturns] = React.useState(0.0);
	const [suggPromptsAmount] = useDebounce(stakeInput / 16, 0);
	const [suggPromptsData, setSuggPromptsData] = React.useState([]);
	const [validatorData, setValidatorData] = React.useState([]);
	const [errorState, setErrorState] = React.useState(false);
	const [intentionData, setIntentionData] = React.useState([]);
	const [apiConnected, setApiConnected] = React.useState(false);
	const [isLoaded, setIsLoaded] = React.useState(false);
	const [riskLevel, setRiskLevel] = React.useState(50);
	const [sliderBG, setSliderBG] = React.useState("yellow.300");
	const ERA_PER_DAY = 4;
	// console.log('props - ', props.validatorData);

	function suggPrompts() {
		const data = suggPromptsData.map(validator => {
			const {
				stashId,
				stashIdTruncated,
				name,
				commission,
				totalStake,
				poolReward,
				noOfNominators
			} = validator;
			const userStakeFraction =
				suggPromptsAmount / (suggPromptsAmount + totalStake);
			const dailyEarning = userStakeFraction * poolReward * ERA_PER_DAY;
			return {
				noOfNominators,
				stashId,
				stashIdTruncated,
				name,
				commission: `${parseFloat(commission)}%`,
				dailyEarning: isNaN(dailyEarning)
					? "Not enough data"
					: `${dailyEarning.toPrecision(10)} KSM`,
				dailyEarningPrecise: isNaN(dailyEarning) ? 0 : dailyEarning
			};
		});
		data.sort((a, b) => b.dailyEarningPrecise - a.dailyEarningPrecise);
		const top16data = [...data.slice(0, 16)];
		// console.log("table data of top 16 val - ", top16data);
		if (top16data.length > 0) {
			// eslint-disable-next-line no-unused-vars
			const expectedEarning = top16data.reduce((a, b) => ({
				dailyEarningPrecise: a.dailyEarningPrecise + b.dailyEarningPrecise
			}));
			console.log("expected earning of top 16 val - ", expectedEarning);
			setExpectedReturns(expectedEarning.dailyEarningPrecise);
		}
		if (apiConnected) setIsLoaded(true);
	}

	React.useEffect(() => {
		setSuggPromptsData(props.validatorData);
	}, [props]);

	if (errorState) {
		return <ErrorMessage />;
	}

	function calculate() {
		suggPrompts();
	}

	const onRiskChange = value => {
		console.log(value);
		if (value <= 30) {
			setSliderBG("green.300");
		} else if (value > 70) {
			setSliderBG("red.400");
		} else {
			setSliderBG("yellow.300");
		}
	};

	return (
		<React.Fragment>
			<Helmet>
				<title>YieldScan - Returns Calculator</title>
				<meta name='description' content='Validator key stats' />
			</Helmet>
			<LogEvent eventType='Returns calculator view' />
			<Route exact path='/returns-calculator'>
				<Heading mt={12} mb={8}>
					Calculate your returns
				</Heading>
				<Flex alignItems='start' flexWrap='wrap' justifyContent='space-between'>
					<Box minWidth='288px' mr={8}>
						<Box
							color='gray.500'
							fontWeight='semibold'
							letterSpacing='wide'
							fontSize='md'
							mb={8}
						>
							<Flex flexWrap='wrap'>
								<Flex direction='column' mr={8} mb={4}>
									<Text mb={2}>I want to spend</Text>
									<Input
										placeholder='Enter your budget'
										variant='filled'
										type='number'
										min='0'
										step='0.000000000001'
										max='999999999999999'
										value={stakeInput}
										textAlign='center'
										rounded='40px'
										minWidth='200px'
										onChange={e => {
											setStakeInput(parseFloat(e.target.value));
										}}
									/>
								</Flex>
								<Flex direction='column'>
									<Text mb={2}>Currency</Text>
									<InputGroup>
										<InputRightAddon
											align='center'
											px={8}
											children='KSM'
											backgroundColor='#4A5567'
											color='white'
											roundedRight='40px'
											roundedLeft='40px'
										/>
									</InputGroup>
								</Flex>
							</Flex>
						</Box>

						<Box>
							<Text
								color='gray.500'
								fontWeight='semibold'
								letterSpacing='wide'
								fontSize='md'
								mt={8}
								mb={4}
							>
								With Risk Level
							</Text>
							<Slider
								defaultValue={50}
								value={riskLevel}
								onChange={value => {
									setRiskLevel(value);
									onRiskChange(value);
								}}
							>
								<SliderTrack />
								<SliderFilledTrack bg={sliderBG} />
								<SliderThumb />
							</Slider>
							<Flex
								justifyContent='space-between'
								width='100%'
								color='gray.500'
								letterSpacing='wide'
								fontSize='sm'
								mb={8}
							>
								<Text>Low</Text>
								<Text>Medium</Text>
								<Text>High</Text>
							</Flex>
						</Box>
						<Button
							marginTop='10%'
							fontSize='lg'
							background='#19CC95'
							color='white'
							rounded='40px'
							mb={16}
							onClick={calculate}
						>
							Calculate
						</Button>
					</Box>
					<Box
						p={8}
						pb={16}
						borderWidth='1px'
						rounded={16}
						overflow='hidden'
						background='#19CC95'
						color='white'
						minWidth='288px'
					>
						<Heading>Expected Results</Heading>
						<Text fontSize='md' mt={6} mb={2}>
							Expected Daily Returns
						</Text>
						<Heading>
							<CountUp
								end={Number(expectedReturns.toFixed(5))}
								decimals={3}
								suffix=' KSM'
							/>
						</Heading>
						<Button mt={8} background='white' color='#19CC95' rounded='40px'>
							Start Investing
						</Button>
					</Box>
				</Flex>
			</Route>
		</React.Fragment>
	);
}
