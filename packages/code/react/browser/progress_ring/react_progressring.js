screens.react.ProgressRing = ({ radius, stroke, strokeDasharray, progress, color, fill = "transparent", ...props }) => {
    const multiplier = 2;
    const normalizedRadius = radius - stroke * multiplier;
    const circumference = normalizedRadius * multiplier * Math.PI;
    const strokeDashoffset = circumference - progress / 100 * circumference;
    strokeDasharray = strokeDasharray || circumference + ' ' + circumference;
    return (
        <svg
            height={radius * multiplier}
            width={radius * multiplier}
            {...props}
        >
            <circle
                stroke={color}
                fill={fill}
                strokeWidth={stroke}
                strokeDasharray={strokeDasharray}
                style={{ strokeDashoffset }}
                stroke-width={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};

screens.react.ProgressRing.Loading = ({ speed = 1000, show, style, color, strokeDasharray, radius, ...props }) => {
    const { util, ProgressRing } = screens.react;
    const object = util.useObject();
    const { nightMode, fontSize } = screens.ui.theme.options;
    radius = radius || screens.ui.basic.emToPixels(object, parseFloat(fontSize) / 1);
    const [start, stop] = util.useInterval(speed, true);
    const [progress, setProgress] = React.useState(0);
    style = style || {};
    color = color || nightMode ? "white" : "black";
    show = true;
    style.visibility = show ? "visible" : "hidden";
    strokeDasharray = strokeDasharray || 2.5;
    React.useEffect(() => {
        if (!show) {
            stop();
            return;
        }
        start(() => {
            setProgress(progress => {
                if (progress >= 100) {
                    progress = 0;
                }
                progress += 10;
                return progress;
            });
        });
    }, [show]);
    return (<ProgressRing progress={progress} strokeDasharray={strokeDasharray} color={color} radius={radius} style={style} {...props} />);
};
