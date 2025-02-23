export const digitalSelectStyle = {
    control: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: 'black',
        color: 'green',
        fontFamily: 'Orbitron',
        borderColor: 'black',
        borderRadius: 0
    }),
    singleValue: (baseStyles, state) => ({
        ...baseStyles,                    
        color: 'green'
    }),
    placeholder: (baseStyles, state) => ({
        ...baseStyles,                    
        color: 'green'
    }),
    option: (baseStyles, state) => ({
        ...baseStyles,    
        backgroundColor: 'black',                
        color: 'green',
        fontFamily: 'Orbitron',
        "&:hover": {
            color: "DarkSeaGreen"
          }
    }),
    dropdownIndicator: (baseStyles, state) => ({
        ...baseStyles,                    
        color: 'green'
    }),             
    menu: (baseStyles, state) => ({
        ...baseStyles,    
        backgroundColor: 'black'
    }),
};